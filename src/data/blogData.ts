import blogIslandImg from "@/assets/blog-island.jpg";
import blogEuropeImg from "@/assets/blog-europe.jpg";
import blogTempleImg from "@/assets/blog-temple.jpg";
import blogDesertImg from "@/assets/blog-desert.jpg";
import destBaliImg from "@/assets/dest-bali.jpg";
import destParisImg from "@/assets/dest-paris.jpg";
import destTokyoImg from "@/assets/dest-tokyo.jpg";
import destPeruImg from "@/assets/dest-peru.jpg";
import blogIslandFishingImg from "@/assets/blog-island-fishing.jpg";
import blogEuropeAlleyImg from "@/assets/blog-europe-alley.jpg";
import blogTempleInteriorImg from "@/assets/blog-temple-interior.jpg";
import blogDesertCaravanImg from "@/assets/blog-desert-caravan.jpg";

export interface BlogPost {
  slug: string;
  image: string;
  contentImage: string;
  date: string;
  title: string;
  sections: { heading: string; text: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "discovering-island-life-beyond-luxury",
    image: blogIslandImg,
    contentImage: blogIslandFishingImg,
    date: "25 Feb 2026",
    title: "Discovering Island Life Beyond Luxury",
    sections: [
      { heading: "Introduction", text: "Island destinations are often seen as luxury escapes, but their true essence lies in daily life, culture, and natural rhythm. Beyond resorts, islands offer simple experiences." },
      { heading: "Culture Shaped by the Sea", text: "Island communities live closely connected to nature. Fishing traditions, local cuisine, and community gatherings reflect a slower, more mindful way of life." },
      { heading: "Nature at Its Purest", text: "Beaches, forests, cliffs, and open waters create a sense of freedom. These natural spaces invite relaxation and quiet exploration without distraction." },
      { heading: "Why Planning Enhances the Experience", text: "Exploring islands thoughtfully helps balance comfort and discovery. Choosing the right locations and pace ensures travelers experience both beauty and authenticity." },
      { heading: "A Sense of Escape", text: "Sunset walks, ocean sounds, and peaceful mornings create moments that stay with travelers long after they return home." },
    ],
  },
  {
    slug: "experiencing-europe-beyond-tourist-routes",
    image: blogEuropeImg,
    contentImage: blogEuropeAlleyImg,
    date: "10 Mar 2026",
    title: "Experiencing Europe Beyond Tourist Routes",
    sections: [
      { heading: "Introduction", text: "Europe's charm extends far beyond its famous landmarks. Cobblestone alleys, village markets, and local cafés reveal a continent rich with untold stories and hidden beauty." },
      { heading: "The Art of Getting Lost", text: "Wandering without a map through narrow streets leads to unexpected discoveries — a tucked-away bakery, a centuries-old courtyard, or a mural that captures local history." },
      { heading: "Local Flavors", text: "From handmade pasta in Italian hill towns to fresh pastries in French villages, regional cuisine tells the story of place, tradition, and community better than any guidebook." },
      { heading: "Slow Travel", text: "Trading fast trains for cycling paths or countryside walks allows travelers to absorb the landscape and connect with the rhythm of rural European life." },
      { heading: "A Different Perspective", text: "Stepping off the tourist trail transforms a vacation into a journey. Europe rewards those who seek depth over speed." },
    ],
  },
  {
    slug: "ancient-temples-and-hidden-spiritual-paths",
    image: blogTempleImg,
    contentImage: blogTempleInteriorImg,
    date: "13 Mar 2026",
    title: "Ancient Temples and Hidden Spiritual Paths",
    sections: [
      { heading: "Introduction", text: "Temples are more than architecture — they are living records of devotion, artistry, and cultural identity. Visiting them is a journey inward as much as outward." },
      { heading: "Sacred Silence", text: "The hush inside ancient temple halls invites reflection. Incense, candlelight, and centuries of prayer create an atmosphere that transcends time." },
      { heading: "Art and Symbolism", text: "Every carving, mural, and golden statue carries meaning. Understanding these symbols deepens the experience from sightseeing to spiritual connection." },
      { heading: "Hidden Paths", text: "Beyond the famous temples lie lesser-known shrines tucked into mountainsides, forests, and village edges — places where spirituality feels raw and personal." },
      { heading: "Carrying It Home", text: "The stillness found in these spaces lingers. Many travelers find that temple visits reshape how they approach daily life long after the journey ends." },
    ],
  },
  {
    slug: "desert-adventures-that-change-perspectives",
    image: blogDesertImg,
    contentImage: blogDesertCaravanImg,
    date: "22 Mar 2026",
    title: "Desert Adventures That Change Perspectives",
    sections: [
      { heading: "Introduction", text: "The desert strips away noise and distraction, leaving only sky, sand, and silence. It's a landscape that challenges and transforms every traveler who enters." },
      { heading: "Life in the Dunes", text: "Nomadic cultures have thrived in deserts for millennia. Their hospitality, navigation skills, and storytelling traditions offer profound lessons in resilience and simplicity." },
      { heading: "The Caravan Experience", text: "Crossing dunes by camel at golden hour connects travelers to ancient trade routes. The rhythm of the journey creates a meditative state unlike any other travel experience." },
      { heading: "Stargazing", text: "Desert skies offer some of the clearest views of the cosmos. Without light pollution, the Milky Way becomes a canopy — a reminder of vastness and wonder." },
      { heading: "Transformation", text: "The desert doesn't just change your itinerary — it changes how you see the world. Silence becomes a luxury, and simplicity becomes a goal." },
    ],
  },
  {
    slug: "discovering-the-soul-of-bali",
    image: destBaliImg,
    contentImage: blogIslandFishingImg,
    date: "19 Jan 2026",
    title: "Discovering the Soul of Bali",
    sections: [
      { heading: "Introduction", text: "Bali is more than beaches and rice terraces. It's a place where spirituality infuses every aspect of daily life, from morning offerings to temple ceremonies." },
      { heading: "Temple Culture", text: "With over 20,000 temples, Bali's spiritual landscape is woven into every village. Each temple tells a story of devotion, art, and community." },
      { heading: "The Rice Terraces", text: "The subak irrigation system, a UNESCO heritage, reflects Bali's philosophy of harmony between humans and nature — a living lesson in sustainable living." },
      { heading: "Local Artisans", text: "From silver smithing in Celuk to wood carving in Mas, Balinese artisans keep centuries-old traditions alive with remarkable skill and dedication." },
      { heading: "Finding Peace", text: "Whether in a quiet temple or watching a Kecak dance at sunset, Bali offers moments of profound peace that stay with you forever." },
    ],
  },
  {
    slug: "a-parisian-weekend-you-wont-forget",
    image: destParisImg,
    contentImage: blogEuropeAlleyImg,
    date: "05 Feb 2026",
    title: "A Parisian Weekend You Won't Forget",
    sections: [
      { heading: "Introduction", text: "Paris rewards the unhurried. A weekend spent wandering its arrondissements reveals layers of beauty that guidebooks only begin to describe." },
      { heading: "Morning Light", text: "The Seine at dawn, café au lait on a zinc counter, and the soft glow of Haussmann facades — Paris mornings are their own kind of magic." },
      { heading: "Hidden Gardens", text: "Beyond the Tuileries lie secret gardens like the Jardin Anne Frank and Square du Vert-Galant, where Parisians escape for quiet reflection." },
      { heading: "The Food", text: "From a perfect croissant to a late-night crème brûlée, Parisian cuisine is an art form best experienced in neighborhood bistros far from tourist crowds." },
      { heading: "Lasting Impressions", text: "Paris doesn't reveal itself all at once. Each visit peels back another layer, leaving you longing to return." },
    ],
  },
  {
    slug: "tokyo-after-dark-neon-and-nightlife",
    image: destTokyoImg,
    contentImage: blogTempleInteriorImg,
    date: "28 Feb 2026",
    title: "Tokyo After Dark: Neon & Nightlife",
    sections: [
      { heading: "Introduction", text: "When the sun sets, Tokyo transforms. Neon signs flicker to life, alleyways glow with lantern light, and the city's energy shifts into something electric." },
      { heading: "Shinjuku's Golden Gai", text: "This maze of tiny bars, each seating six to eight people, offers intimate encounters with Tokyo's creative class — musicians, writers, and filmmakers." },
      { heading: "Late-Night Ramen", text: "Nothing captures Tokyo's nocturnal spirit like a steaming bowl of tonkotsu ramen at 2 AM in a hole-in-the-wall shop with counter-only seating." },
      { heading: "Shibuya Crossing", text: "At night, the world's busiest intersection becomes a symphony of movement and light — a quintessential Tokyo moment best observed from above." },
      { heading: "The Quiet Side", text: "Even in the neon glow, Tokyo has pockets of midnight serenity — temple grounds, riverside paths, and late-night jazz bars where time slows." },
    ],
  },
  {
    slug: "discovering-the-calm-of-mountain-travel",
    image: destPeruImg,
    contentImage: blogDesertCaravanImg,
    date: "12 Mar 2026",
    title: "Discovering the Calm of Mountain Travel",
    sections: [
      { heading: "Introduction", text: "Mountains demand presence. The thin air, vast views, and physical challenge strip away the noise of daily life and bring clarity." },
      { heading: "The Andean Way", text: "In Peru's highlands, ancient Quechua communities maintain traditions unchanged for centuries. Their relationship with the mountains is one of deep reverence." },
      { heading: "Trekking Mindfully", text: "Slow, intentional hiking through mountain passes allows travelers to notice details — wildflowers, bird calls, and the way light shifts across valleys." },
      { heading: "High-Altitude Solitude", text: "Above the tree line, the world simplifies. There's only sky, stone, and the sound of wind — a profound experience of natural minimalism." },
      { heading: "Coming Down Changed", text: "Descending from the mountains, travelers often carry a renewed sense of perspective. The calm of altitude becomes a mindset, not just a memory." },
    ],
  },
];
