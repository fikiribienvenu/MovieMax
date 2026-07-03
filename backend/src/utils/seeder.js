// src/utils/seeder.js
"use strict";

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/database");
const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Subscription = require("../models/Subscription.model");
const Review = require("../models/Review.model");

// ─── Seed Data ────────────────────────────────────────────────────────────────

const adminUser = {
  name: "Admin CineMax",
  email: "admin@cinemax.com",
  password: "Admin@1234",
  role: "admin",
  isVerified: true,
};

const regularUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
  password: "Alex@1234",
  role: "user",
  isVerified: true,
};

const moviesData = [
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster: { url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80" },
    trailer: { youtubeId: "Way9Dexny3w", url: "https://www.youtube.com/embed/Way9Dexny3w" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", quality: "4K", duration: 9960 },
    category: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides" },
      { name: "Zendaya", character: "Chani" },
      { name: "Rebecca Ferguson", character: "Lady Jessica" },
    ],
    year: 2024,
    releaseDate: new Date("2024-03-01"),
    duration: 166,
    ageRating: "PG-13",
    isFeatured: true,
    isTrending: true,
    badge: "new",
    tags: ["epic", "space", "desert", "sci-fi"],
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A stunning portrayal of brilliance, moral ambiguity, and the weight of historical consequence.",
    poster: { url: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=1600&q=80" },
    trailer: { youtubeId: "uYPbbksJxIg", url: "https://www.youtube.com/embed/uYPbbksJxIg" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", quality: "4K", duration: 10800 },
    category: "Drama",
    genres: ["Drama", "History", "Biography"],
    director: "Christopher Nolan",
    cast: [
      { name: "Cillian Murphy", character: "J. Robert Oppenheimer" },
      { name: "Emily Blunt", character: "Katherine Oppenheimer" },
      { name: "Matt Damon", character: "Leslie Groves" },
    ],
    year: 2023,
    releaseDate: new Date("2023-07-21"),
    duration: 180,
    ageRating: "R",
    isTrending: true,
    badge: "new",
    tags: ["historical", "war", "biography", "oscar"],
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: { url: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1600&q=80" },
    trailer: { youtubeId: "EXeTwQWrcwY", url: "https://www.youtube.com/embed/EXeTwQWrcwY" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", quality: "1080p", duration: 9120 },
    category: "Action",
    genres: ["Action", "Crime", "Drama"],
    director: "Christopher Nolan",
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman" },
      { name: "Heath Ledger", character: "The Joker" },
      { name: "Aaron Eckhart", character: "Harvey Dent" },
    ],
    year: 2008,
    duration: 152,
    ageRating: "PG-13",
    isTrending: false,
    tags: ["superhero", "crime", "gotham"],
  },
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. A breathtaking journey through time, space, and the human condition.",
    poster: { url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1600&q=80" },
    trailer: { youtubeId: "zSWdZVtXT7E", url: "https://www.youtube.com/embed/zSWdZVtXT7E" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", quality: "4K", duration: 10140 },
    category: "Sci-Fi",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    director: "Christopher Nolan",
    cast: [
      { name: "Matthew McConaughey", character: "Cooper" },
      { name: "Anne Hathaway", character: "Brand" },
      { name: "Jessica Chastain", character: "Murph" },
    ],
    year: 2014,
    duration: 169,
    ageRating: "PG-13",
    isTrending: true,
    tags: ["space", "time", "wormhole", "family"],
  },
  {
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son. A timeless saga of power, loyalty, and family.",
    poster: { url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&q=80" },
    trailer: { youtubeId: "sY1S34973zA", url: "https://www.youtube.com/embed/sY1S34973zA" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", quality: "1080p", duration: 10500 },
    category: "Drama",
    genres: ["Drama", "Crime"],
    director: "Francis Ford Coppola",
    cast: [
      { name: "Marlon Brando", character: "Vito Corleone" },
      { name: "Al Pacino", character: "Michael Corleone" },
      { name: "James Caan", character: "Sonny Corleone" },
    ],
    year: 1972,
    duration: 175,
    ageRating: "R",
    tags: ["mafia", "classic", "crime", "family"],
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: { url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=80" },
    trailer: { youtubeId: "YoHD9XEInc0", url: "https://www.youtube.com/embed/YoHD9XEInc0" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", quality: "4K", duration: 8880 },
    category: "Thriller",
    genres: ["Thriller", "Sci-Fi", "Action"],
    director: "Christopher Nolan",
    cast: [
      { name: "Leonardo DiCaprio", character: "Cobb" },
      { name: "Joseph Gordon-Levitt", character: "Arthur" },
      { name: "Tom Hardy", character: "Eames" },
    ],
    year: 2010,
    duration: 148,
    ageRating: "PG-13",
    isTrending: true,
    tags: ["dreams", "heist", "mind-bending"],
  },
  {
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: { url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1600&q=80" },
    trailer: { youtubeId: "5xH0HfJHsaY", url: "https://www.youtube.com/embed/5xH0HfJHsaY" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", quality: "1080p", duration: 7920 },
    category: "Thriller",
    genres: ["Thriller", "Drama", "Comedy"],
    director: "Bong Joon-ho",
    cast: [
      { name: "Song Kang-ho", character: "Kim Ki-taek" },
      { name: "Lee Sun-kyun", character: "Park Dong-ik" },
      { name: "Cho Yeo-jeong", character: "Choi Yeon-gyo" },
    ],
    year: 2019,
    duration: 132,
    ageRating: "R",
    tags: ["korean", "class", "oscar", "social"],
  },
  {
    title: "Avengers: Endgame",
    description: "After the devastating events of Infinity War, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    poster: { url: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1600&q=80" },
    trailer: { youtubeId: "TcMBFSGVi1c", url: "https://www.youtube.com/embed/TcMBFSGVi1c" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", quality: "4K", duration: 10860 },
    category: "Action",
    genres: ["Action", "Adventure", "Sci-Fi"],
    director: "Anthony & Joe Russo",
    cast: [
      { name: "Robert Downey Jr.", character: "Tony Stark / Iron Man" },
      { name: "Chris Evans", character: "Steve Rogers / Captain America" },
      { name: "Scarlett Johansson", character: "Natasha Romanoff" },
    ],
    year: 2019,
    duration: 181,
    ageRating: "PG-13",
    isTrending: true,
    tags: ["marvel", "superhero", "avengers", "blockbuster"],
  },
  {
    title: "La La Land",
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while also having to face the realities of their aspirations and dreams.",
    poster: { url: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=1600&q=80" },
    trailer: { youtubeId: "0pdqf4P9MB8", url: "https://www.youtube.com/embed/0pdqf4P9MB8" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", quality: "1080p", duration: 7680 },
    category: "Romance",
    genres: ["Romance", "Musical", "Drama"],
    director: "Damien Chazelle",
    cast: [
      { name: "Ryan Gosling", character: "Sebastian" },
      { name: "Emma Stone", character: "Mia" },
    ],
    year: 2016,
    duration: 128,
    ageRating: "PG-13",
    tags: ["musical", "love", "los angeles", "jazz"],
  },
  {
    title: "Get Out",
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his uneasiness about their reception grows into something sinister.",
    poster: { url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80" },
    trailer: { youtubeId: "DzfpyUB60YY", url: "https://www.youtube.com/embed/DzfpyUB60YY" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", quality: "1080p", duration: 6240 },
    category: "Horror",
    genres: ["Horror", "Thriller", "Mystery"],
    director: "Jordan Peele",
    cast: [
      { name: "Daniel Kaluuya", character: "Chris Washington" },
      { name: "Allison Williams", character: "Rose Armitage" },
    ],
    year: 2017,
    duration: 104,
    ageRating: "R",
    badge: "new",
    tags: ["horror", "social", "race", "thriller"],
  },
  {
    title: "Everything Everywhere All at Once",
    description: "A middle-aged Chinese immigrant is swept up in an insane adventure in which she alone can save existence by exploring other universes connecting with the lives she could have led.",
    poster: { url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1600&q=80" },
    trailer: { youtubeId: "wxN1T1uxQ2g", url: "https://www.youtube.com/embed/wxN1T1uxQ2g" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", quality: "4K", duration: 8340 },
    category: "Comedy",
    genres: ["Comedy", "Sci-Fi", "Action"],
    director: "Daniel Kwan & Daniel Scheinert",
    cast: [
      { name: "Michelle Yeoh", character: "Evelyn Wang" },
      { name: "Ke Huy Quan", character: "Waymond Wang" },
      { name: "Jamie Lee Curtis", character: "Deirdre Beaubeirdre" },
    ],
    year: 2022,
    duration: 139,
    ageRating: "R",
    isTrending: true,
    badge: "new",
    tags: ["multiverse", "oscar", "comedy", "action"],
  },
  {
    title: "The Batman",
    description: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues targeting Gotham's elite, forcing him to forge new partnerships.",
    poster: { url: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600&q=80" },
    backdrop: { url: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=1600&q=80" },
    trailer: { youtubeId: "mqqft2x_Aa4", url: "https://www.youtube.com/embed/mqqft2x_Aa4" },
    video: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", quality: "4K", duration: 10560 },
    category: "Action",
    genres: ["Action", "Crime", "Drama"],
    director: "Matt Reeves",
    cast: [
      { name: "Robert Pattinson", character: "Bruce Wayne / Batman" },
      { name: "Zoë Kravitz", character: "Selina Kyle / Catwoman" },
      { name: "Colin Farrell", character: "The Penguin" },
    ],
    year: 2022,
    duration: 176,
    ageRating: "PG-13",
    isTrending: true,
    tags: ["batman", "detective", "gotham", "dark"],
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting database seed...\n");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Subscription.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data");

    // Create users
    const [admin, user] = await Promise.all([
      User.create(adminUser),
      User.create(regularUser),
    ]);
    console.log(`✅ Created users: ${admin.email}, ${user.email}`);

    // Create movies
    const movies = await Movie.create(moviesData);
    console.log(`✅ Created ${movies.length} movies`);

    // Create a subscription for the regular user
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Subscription.create({
      user: user._id,
      plan: "premium",
      status: "active",
      billingCycle: "monthly",
      price: { amount: 1500, currency: "usd" },
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      payments: [{ amount: 1500, currency: "usd", status: "succeeded", paidAt: now }],
    });

    await User.findByIdAndUpdate(user._id, {
      "subscription.plan": "premium",
      "subscription.status": "active",
      "subscription.currentPeriodStart": now,
      "subscription.currentPeriodEnd": periodEnd,
      watchlist: [movies[0]._id, movies[1]._id, movies[3]._id, movies[5]._id],
    });
    console.log(`✅ Created subscription for ${user.email}`);

    // Create sample reviews
    const reviewsData = [
      {
        movie: movies[0]._id,
        user: user._id,
        rating: 9,
        title: "A stunning visual masterpiece",
        body: "Denis Villeneuve has outdone himself with this sequel. The world-building is extraordinary, the cinematography breathtaking, and the performances are outstanding. Zendaya and Chalamet have incredible chemistry.",
        containsSpoilers: false,
      },
      {
        movie: movies[1]._id,
        user: admin._id,
        rating: 10,
        title: "An absolute cinematic triumph",
        body: "Cillian Murphy delivers a career-defining performance. Nolan masterfully weaves together timelines to explore the moral complexities of scientific discovery. The non-linear storytelling keeps you on edge throughout.",
        containsSpoilers: false,
      },
      {
        movie: movies[2]._id,
        user: user._id,
        rating: 10,
        title: "The greatest superhero film ever made",
        body: "Heath Ledger's Joker is one of the most iconic performances in cinema history. The film transcends the superhero genre and works as a brilliant crime thriller. A timeless classic.",
        containsSpoilers: false,
      },
    ];

    await Review.create(reviewsData);
    console.log(`✅ Created ${reviewsData.length} sample reviews`);

    console.log("\n🎬 Database seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 Admin:   ${adminUser.email} / ${adminUser.password}`);
    console.log(`👤 User:    ${regularUser.email} / ${regularUser.password}`);
    console.log(`🎥 Movies:  ${movies.length} seeded`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedDatabase();
