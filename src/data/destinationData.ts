import japanBg from "@/assets/dest-japan-bg.jpg";
import switzerlandBg from "@/assets/dest-switzerland-bg.jpg";
import parisBg from "@/assets/dest-paris-bg.jpg";
import nycBg from "@/assets/dest-nyc-bg.jpg";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import heroJapanImg from "@/assets/hero-japan.jpg";
import heroSwitzerlandImg from "@/assets/hero-switzerland.jpg";
import heroParisImg from "@/assets/hero-paris.jpg";
import heroNycImg from "@/assets/hero-nyc.jpg";
import kyotoImg from "@/assets/dest-kyoto.jpg";
import parisEiffelImg from "@/assets/dest-paris-eiffel.jpg";

export interface Destination {
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  cardImage: string;
  bgImage: string;
  popularCities: string;
  idealDuration: string;
  bestTime: string;
  aboutHeadline: string;
  aboutText: string[];
  whyVisitText: string;
  uniquePropositions: string[];
  whyVisitClosing: string;
  galleryImages: string[];
}

export const destinations: Destination[] = [
  {
    slug: "japan",
    name: "Japan",
    tagline: "Technology, vibrant nightlife & traditions",
    heroImage: heroJapanImg,
    cardImage: tokyoImg,
    bgImage: japanBg,
    popularCities: "Tokyo · Kyoto · Osaka",
    idealDuration: "7 – 10 Days",
    bestTime: "Mar–May, Sep–Nov",
    aboutHeadline: "A timeless blend of tradition, modern innovation, and unforgettable experiences.",
    aboutText: [
      "Japan is an island nation in East Asia, known for its seamless balance between ancient traditions and cutting-edge modern life. From historic temples and peaceful shrines to futuristic cityscapes and efficient transport systems, Japan offers a deeply enriching travel experience.",
      "Cultural values of respect, harmony, and attention to detail are reflected in daily life, cuisine, architecture, and hospitality across the country.",
    ],
    whyVisitText: "Japan offers a unique journey where history, culture, and nature coexist effortlessly. Whether exploring cherry blossom-lined streets, savoring world-class cuisine, or discovering serene countryside landscapes, the country caters to travelers seeking depth, discovery, and unforgettable moments.",
    uniquePropositions: [
      "Rich cultural heritage and traditions",
      "Iconic landmarks and scenic landscapes",
      "World-class cuisine and hospitality",
      "Safe, clean, and traveler-friendly",
    ],
    whyVisitClosing: "What truly sets Japan apart is how immersive and thoughtful each experience feels. Whether wandering through quiet temple grounds, enjoying a traditional meal, or navigating lively urban streets, every moment feels intentional and deeply memorable.",
    galleryImages: [tokyoImg, kyotoImg],
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    tagline: "Alpine beauty, precision, and timeless charm",
    heroImage: heroSwitzerlandImg,
    cardImage: baliImg,
    bgImage: switzerlandBg,
    popularCities: "Zurich · Lucerne · Interlaken",
    idealDuration: "5 – 8 Days",
    bestTime: "Jun–Sep, Dec–Mar",
    aboutHeadline: "Where pristine alpine landscapes meet world-class hospitality and adventure.",
    aboutText: [
      "Switzerland is a landlocked country in Central Europe, renowned for its breathtaking alpine scenery, crystal-clear lakes, and charming villages. The country offers a perfect blend of outdoor adventure and refined culture.",
      "From luxury train journeys to adrenaline-pumping ski slopes, Switzerland caters to every type of traveler with its impeccable infrastructure and warm hospitality.",
    ],
    whyVisitText: "Switzerland invites you to experience nature at its most majestic. Whether skiing in the Alps, cruising on Lake Geneva, or exploring medieval old towns, every corner offers postcard-worthy beauty.",
    uniquePropositions: [
      "Stunning alpine scenery year-round",
      "World-famous chocolate and cheese",
      "Efficient and scenic train networks",
      "Multilingual culture and vibrant cities",
    ],
    whyVisitClosing: "Switzerland's magic lies in its ability to combine adventure with tranquility. The mountains, valleys, and lakeside villages create a harmony that stays with you long after you leave.",
    galleryImages: [baliImg, heroSwitzerlandImg],
  },
  {
    slug: "paris",
    name: "Paris",
    tagline: "Romance, culture, and timeless charm",
    heroImage: heroParisImg,
    cardImage: parisImg,
    bgImage: parisBg,
    popularCities: "Paris · Versailles · Lyon",
    idealDuration: "4 – 7 Days",
    bestTime: "Apr–Jun, Sep–Oct",
    aboutHeadline: "The City of Light — where art, fashion, and romance come alive on every corner.",
    aboutText: [
      "Paris, the capital of France, is one of the most iconic cities in the world. Known for its stunning architecture, world-class museums, and vibrant café culture, Paris offers an unparalleled cultural experience.",
      "From the Eiffel Tower to the Louvre, from Montmartre's cobblestone streets to the banks of the Seine, every neighborhood tells a unique story of art, history, and elegance.",
    ],
    whyVisitText: "Paris captivates with its blend of timeless beauty and modern sophistication. Whether savoring a croissant in a sidewalk café, strolling through hidden gardens, or admiring masterpieces in world-famous galleries, the city offers endless moments of wonder.",
    uniquePropositions: [
      "Iconic landmarks and architecture",
      "World-renowned art and museums",
      "Exquisite cuisine and café culture",
      "Fashion capital of the world",
    ],
    whyVisitClosing: "What makes Paris truly unforgettable is its atmosphere — the golden light at sunset along the Seine, the aroma of fresh bread from corner boulangeries, and the feeling that beauty is woven into every detail of daily life.",
    galleryImages: [parisImg, parisEiffelImg],
  },
  {
    slug: "new-york",
    name: "New York",
    tagline: "Diverse culture, iconic skyline, & bustling streets",
    heroImage: heroNycImg,
    cardImage: nycImg,
    bgImage: nycBg,
    popularCities: "Manhattan · Brooklyn · Queens",
    idealDuration: "5 – 8 Days",
    bestTime: "Apr–Jun, Sep–Nov",
    aboutHeadline: "The city that never sleeps — where ambition, diversity, and energy collide.",
    aboutText: [
      "New York City is the cultural and financial capital of the world. With its towering skyscrapers, diverse neighborhoods, and endless entertainment options, NYC offers an experience unlike any other city on Earth.",
      "From Broadway shows and world-class dining to Central Park and the Statue of Liberty, every visit reveals new layers of this extraordinary metropolis.",
    ],
    whyVisitText: "New York City is a place where dreams are built and cultures converge. Whether exploring the street art of Bushwick, shopping on Fifth Avenue, or catching a sunset from the Brooklyn Bridge, the city pulses with possibility.",
    uniquePropositions: [
      "Iconic skyline and architecture",
      "Unmatched cultural diversity",
      "World-class dining and nightlife",
      "Endless entertainment options",
    ],
    whyVisitClosing: "New York's true magic is its energy — the feeling that anything is possible, at any hour of the day. It's a city that rewards curiosity and never stops surprising you.",
    galleryImages: [nycImg, heroNycImg],
  },
];

export const getDestinationBySlug = (slug: string): Destination | undefined =>
  destinations.find((d) => d.slug === slug);
