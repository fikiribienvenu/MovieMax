// src/lib/data.ts
import { Movie, Plan } from "@/types";

export const movies: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    description:
      "Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    videoUrl: "/videos/dune2.mp4",
    category: "Sci-Fi",
    rating: 8.8,
    year: 2024,
    duration: "2h 46m",
    genre: "Sci-Fi · Adventure · Drama",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin"],
    trending: true,
    badge: "new",
  },
  {
    id: 2,
    title: "Oppenheimer",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A stunning portrayal of brilliance, moral ambiguity, and the weight of historical consequence.",
    poster: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    videoUrl: "/videos/oppenheimer.mp4",
    category: "Drama",
    rating: 8.9,
    year: 2023,
    duration: "3h 0m",
    genre: "Drama · History · Biography",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    trending: true,
    badge: "new",
  },
  {
    id: 3,
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    videoUrl: "/videos/darkknight.mp4",
    category: "Action",
    rating: 9.0,
    year: 2008,
    duration: "2h 32m",
    genre: "Action · Crime · Drama",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Maggie Gyllenhaal"],
    trending: false,
    badge: null,
  },
  {
    id: 4,
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. A breathtaking journey through time, space, and the human condition.",
    poster: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    videoUrl: "/videos/interstellar.mp4",
    category: "Sci-Fi",
    rating: 8.7,
    year: 2014,
    duration: "2h 49m",
    genre: "Sci-Fi · Drama · Adventure",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    trending: true,
    badge: null,
  },
  {
    id: 5,
    title: "The Godfather",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son. A timeless saga of power, loyalty, and family.",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/sY1S34973zA",
    videoUrl: "/videos/godfather.mp4",
    category: "Drama",
    rating: 9.2,
    year: 1972,
    duration: "2h 55m",
    genre: "Drama · Crime",
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
    trending: false,
    badge: null,
  },
  {
    id: 6,
    title: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    videoUrl: "/videos/inception.mp4",
    category: "Thriller",
    rating: 8.8,
    year: 2010,
    duration: "2h 28m",
    genre: "Thriller · Sci-Fi · Action",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    trending: true,
    badge: null,
  },
  {
    id: 7,
    title: "Parasite",
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/5xH0HfJHsaY",
    videoUrl: "/videos/parasite.mp4",
    category: "Thriller",
    rating: 8.6,
    year: 2019,
    duration: "2h 12m",
    genre: "Thriller · Drama · Comedy",
    director: "Bong Joon-ho",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    trending: false,
    badge: null,
  },
  {
    id: 8,
    title: "Avengers: Endgame",
    description:
      "After the devastating events of Infinity War, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c",
    videoUrl: "/videos/endgame.mp4",
    category: "Action",
    rating: 8.4,
    year: 2019,
    duration: "3h 1m",
    genre: "Action · Adventure · Sci-Fi",
    director: "Anthony & Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    trending: true,
    badge: null,
  },
  {
    id: 9,
    title: "La La Land",
    description:
      "While navigating their careers in Los Angeles, a pianist and an actress fall in love while also having to face the realities of their aspirations.",
    poster: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/0pdqf4P9MB8",
    videoUrl: "/videos/lalaland.mp4",
    category: "Romance",
    rating: 8.0,
    year: 2016,
    duration: "2h 8m",
    genre: "Romance · Musical · Drama",
    director: "Damien Chazelle",
    cast: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"],
    trending: false,
    badge: null,
  },
  {
    id: 10,
    title: "Get Out",
    description:
      "A young African-American visits his white girlfriend's parents for the weekend, where his uneasiness about their reception grows into something sinister.",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/DzfpyUB60YY",
    videoUrl: "/videos/getout.mp4",
    category: "Horror",
    rating: 7.7,
    year: 2017,
    duration: "1h 44m",
    genre: "Horror · Thriller · Mystery",
    director: "Jordan Peele",
    cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford", "Catherine Keener"],
    trending: false,
    badge: "new",
  },
  {
    id: 11,
    title: "Everything Everywhere",
    description:
      "A middle-aged Chinese immigrant is swept up in an insane adventure in which she alone can save existence by exploring other universes connecting with the lives she could have led.",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/wxN1T1uxQ2g",
    videoUrl: "/videos/everywhere.mp4",
    category: "Comedy",
    rating: 8.1,
    year: 2022,
    duration: "2h 19m",
    genre: "Comedy · Sci-Fi · Action",
    director: "Daniel Kwan & Daniel Scheinert",
    cast: ["Michelle Yeoh", "Ke Huy Quan", "Jamie Lee Curtis", "Stephanie Hsu"],
    trending: true,
    badge: "new",
  },
  {
    id: 12,
    title: "The Batman",
    description:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues targeting Gotham's elite.",
    poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=1600&q=80",
    trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4",
    videoUrl: "/videos/batman.mp4",
    category: "Action",
    rating: 7.9,
    year: 2022,
    duration: "2h 56m",
    genre: "Action · Crime · Drama",
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Jeffrey Wright", "Colin Farrell"],
    trending: true,
    badge: null,
  },
];

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 8,
    period: "per month",
    description: "Perfect for solo viewers",
    color: "border-border",
    features: [
      { text: "HD 720p streaming", included: true },
      { text: "1 screen at a time", included: true },
      { text: "Access to 500+ movies", included: true },
      { text: "Mobile & Tablet", included: true },
      { text: "4K Ultra HD", included: false },
      { text: "Download offline", included: false },
      { text: "Family profiles (6)", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 15,
    period: "per month",
    description: "Best for movie enthusiasts",
    color: "border-brand-gold",
    popular: true,
    features: [
      { text: "4K Ultra HD streaming", included: true },
      { text: "4 screens at a time", included: true },
      { text: "Access to ALL movies", included: true },
      { text: "All devices + Smart TV", included: true },
      { text: "Download offline", included: true },
      { text: "Early access to releases", included: true },
      { text: "Family profiles (4)", included: true },
    ],
  },
  {
    id: "annual",
    name: "Annual",
    price: 99,
    period: "per year",
    description: "Save 45% — Best value",
    color: "border-brand-red",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Priority customer support", included: true },
      { text: "Exclusive originals", included: true },
      { text: "6 screens at a time", included: true },
      { text: "Family profiles (6)", included: true },
      { text: "No ads — ever", included: true },
      { text: "Download offline", included: true },
    ],
  },
];

export const getFeaturedMovie = () => movies[0];

export const getTrendingMovies = () => movies.filter((m) => m.trending);

export const getLatestMovies = () =>
  movies.filter((m) => m.year >= 2022).sort((a, b) => b.year - a.year);

export const getTopRatedMovies = () =>
  [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8);

export const getMovieById = (id: number) =>
  movies.find((m) => m.id === id) || null;

export const searchMovies = (query: string, category: string) => {
  let result = [...movies];
  if (query) {
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genre.toLowerCase().includes(query.toLowerCase()) ||
        m.director.toLowerCase().includes(query.toLowerCase()) ||
        m.cast.some((c) => c.toLowerCase().includes(query.toLowerCase()))
    );
  }
  if (category && category !== "all") {
    result = result.filter((m) => m.category === category);
  }
  return result;
};
