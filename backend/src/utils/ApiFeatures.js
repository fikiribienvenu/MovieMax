// src/utils/ApiFeatures.js
"use strict";

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filter out reserved keywords and apply remaining as MongoDB filters
   * Supports operators: gte, gt, lte, lt (e.g. ?rating[gte]=7)
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering: convert {gte: '7'} → {$gte: 7}
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Text search across indexed fields
   */
  search(field = "title") {
    if (this.queryString.search) {
      const searchTerm = this.queryString.search.trim();
      if (searchTerm) {
        this.query = this.query.find({
          $text: { $search: searchTerm },
        });
      }
    }
    return this;
  }

  /**
   * Sort results (e.g. ?sort=-rating,year)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  /**
   * Select specific fields (e.g. ?fields=title,rating,poster)
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * Pagination (e.g. ?page=2&limit=20)
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this._page = page;
    this._limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;
