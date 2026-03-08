import moroccoImg from "@/assets/pkg-morocco.jpg";
import italyImg from "@/assets/pkg-italy.jpg";
import africaImg from "@/assets/pkg-africa.jpg";
import japanImg from "@/assets/pkg-japan.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import peruImg from "@/assets/dest-peru.jpg";
import maldivesImg from "@/assets/dest-maldives.jpg";
import barcelonaImg from "@/assets/dest-barcelona.jpg";
import dubaiImg from "@/assets/dest-dubai.jpg";
import kyotoImg from "@/assets/dest-kyoto.jpg";
import capetownImg from "@/assets/dest-capetown.jpg";
import icelandImg from "@/assets/dest-iceland.jpg";
import australiaImg from "@/assets/dest-australia.jpg";
import sydneyImg from "@/assets/dest-sydney.jpg";
import egyptImg from "@/assets/dest-egypt.jpg";
import romeImg from "@/assets/dest-rome.jpg";
import santoriniImg from "@/assets/dest-santorini.jpg";
import singaporeImg from "@/assets/dest-singapore.jpg";
import dubaiSkylineImg from "@/assets/dest-dubai-skyline.jpg";
import amalfiImg from "@/assets/dest-amalfi.jpg";
import thailandImg from "@/assets/dest-thailand.jpg";
import dubaiMarinaImg from "@/assets/dest-dubai-marina.jpg";
import newzealandImg from "@/assets/dest-newzealand.jpg";
import londonImg from "@/assets/dest-london.jpg";
import parisEiffelImg from "@/assets/dest-paris-eiffel.jpg";
import heroImg from "@/assets/hero-travel.jpg";

// High-res hero images (1920x1080)
import heroMoroccoImg from "@/assets/hero-morocco.jpg";
import heroItalyImg from "@/assets/hero-italy.jpg";
import heroParisImg from "@/assets/hero-paris.jpg";
import heroAfricaImg from "@/assets/hero-africa.jpg";
import heroBaliImg from "@/assets/hero-bali.jpg";
import heroJapanImg from "@/assets/hero-japan.jpg";
import heroSwitzerlandImg from "@/assets/hero-switzerland.jpg";
import heroDubaiImg from "@/assets/hero-dubai.jpg";
import heroNycImg from "@/assets/hero-nyc.jpg";
import heroEgyptImg from "@/assets/hero-egypt.jpg";
import heroSantoriniImg from "@/assets/hero-santorini.jpg";
import heroAustraliaImg from "@/assets/hero-australia.jpg";
import heroMaldivesImg from "@/assets/hero-maldives.jpg";
import heroRomeImg from "@/assets/hero-rome.jpg";
import heroThailandImg from "@/assets/hero-thailand.jpg";
import heroNewzealandImg from "@/assets/hero-newzealand.jpg";
import heroLondonImg from "@/assets/hero-london.jpg";
import heroSingaporeImg from "@/assets/hero-singapore.jpg";
import heroPeruImg from "@/assets/hero-peru.jpg";
import heroCapetownImg from "@/assets/hero-capetown.jpg";
import heroBarcelonaImg from "@/assets/hero-barcelona.jpg";
import heroIcelandImg from "@/assets/hero-iceland.jpg";

export interface TourItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TourData {
  slug: string;
  image: string;
  heroImage: string;
  title: string;
  duration: string;
  price: string;
  category: string;
  departure: string;
  groupSize: string;
  inclusions: string;
  overview: string[];
  highlights: string[];
  itinerary: TourItineraryDay[];
  includedItems: string[];
  excludedItems: string[];
  galleryImages: string[];
}

export const allTours: TourData[] = [
  {
    slug: "morocco-desert-journey",
    image: moroccoImg,
    heroImage: heroMoroccoImg,
    title: "Morocco Desert Journey",
    duration: "8 Days / 7 Nights",
    price: "1,600",
    category: "Adventure",
    departure: "November 2026",
    groupSize: "15 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "This Morocco journey introduces to rich traditions, vibrant markets, and dramatic desert landscapes. Designed for cultural immersion, the trip balances city's unique experiences.",
      "Morocco's colors, textures, and storytelling traditions create a journey that feels immersive.",
    ],
    highlights: [
      "Historic medinas and markets",
      "Desert landscapes and cultural camps",
      "Traditional architecture and cuisine",
      "Authentic local experiences",
    ],
    itinerary: [
      { day: 1, title: "Arrival & Orientation", description: "Arrive in Marrakech, check into your riad, and enjoy a short orientation walk through the bustling Jemaa el-Fnaa square." },
      { day: 2, title: "Marrakech Highlights", description: "Explore the Bahia Palace, Majorelle Garden, and the vibrant souks. Lunch at a rooftop restaurant overlooking the medina." },
      { day: 3, title: "Atlas Mountains", description: "Journey into the High Atlas Mountains, visiting Berber villages and enjoying panoramic views of the valleys below." },
      { day: 4, title: "Desert Expedition", description: "Travel to Merzouga and embark on a camel trek into the Sahara dunes. Overnight at a luxury desert camp under the stars." },
      { day: 5, title: "Sahara Sunrise & Gorges", description: "Wake for a breathtaking desert sunrise, then explore the dramatic Todra Gorges and ancient kasbahs." },
      { day: 6, title: "Fes Discovery", description: "Arrive in Fes and explore the world's largest car-free urban area. Visit tanneries, mosques, and artisan workshops." },
      { day: 7, title: "Chefchaouen Blue City", description: "Visit the enchanting blue-washed city of Chefchaouen, wandering its photogenic streets and enjoying local cuisine." },
      { day: 8, title: "Departure", description: "Transfer to the airport with lasting memories of Morocco's magic." },
    ],
    includedItems: ["Accommodation", "Selected meals", "Local transportation", "Guided cultural experiences"],
    excludedItems: ["Flights", "Personal expenses", "Optional activities"],
    galleryImages: [moroccoImg, africaImg, dubaiImg, capetownImg],
  },
  {
    slug: "italy-classic",
    image: italyImg,
    heroImage: heroItalyImg,
    title: "Italy Classic",
    duration: "7 Days / 6 Nights",
    price: "1,400",
    category: "Romantic",
    departure: "September 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "Experience Italy's timeless charm through its art, architecture, and culinary traditions. From Rome's ancient ruins to Venice's canals, every moment is a masterpiece.",
      "This journey captures the romance and history of Italy's most iconic cities and hidden gems.",
    ],
    highlights: [
      "Colosseum and Roman Forum guided tour",
      "Venetian gondola ride at sunset",
      "Tuscan wine tasting experience",
      "Florence's Renaissance art galleries",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Rome", description: "Arrive in Rome, transfer to your boutique hotel near the Spanish Steps. Evening walk through Trastevere." },
      { day: 2, title: "Ancient Rome", description: "Guided tour of the Colosseum, Roman Forum, and Palatine Hill. Afternoon visit to the Pantheon and Piazza Navona." },
      { day: 3, title: "Florence Renaissance", description: "High-speed train to Florence. Visit the Uffizi Gallery, Ponte Vecchio, and the Duomo." },
      { day: 4, title: "Tuscan Countryside", description: "Day trip to the rolling hills of Tuscany. Visit a vineyard, taste local wines, and enjoy a farm-to-table lunch." },
      { day: 5, title: "Venice Arrival", description: "Train to Venice. Settle into your canal-side hotel. Evening gondola ride through the Grand Canal." },
      { day: 6, title: "Venice Exploration", description: "Visit St. Mark's Basilica, Doge's Palace, and the Rialto Market. Glass-blowing demonstration on Murano Island." },
      { day: 7, title: "Departure", description: "Final morning espresso by the canal before your departure transfer." },
    ],
    includedItems: ["Boutique hotels", "Daily breakfast & select dinners", "Train passes", "Guided museum tours"],
    excludedItems: ["International flights", "Travel insurance", "Personal shopping"],
    galleryImages: [italyImg, romeImg, amalfiImg, barcelonaImg],
  },
  {
    slug: "africa-experience",
    image: africaImg,
    heroImage: heroAfricaImg,
    title: "Africa Experience",
    duration: "8 Days / 7 Nights",
    price: "2,200",
    category: "Adventure",
    departure: "October 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, safari, meals",
    overview: [
      "Witness the raw beauty of Africa on this immersive safari and cultural journey. From the vast Serengeti plains to local Maasai villages, this trip connects you to nature and tradition.",
      "Every sunrise brings a new adventure — from wildlife encounters to starlit campfire stories.",
    ],
    highlights: [
      "Big Five safari game drives",
      "Maasai village cultural visit",
      "Ngorongoro Crater exploration",
      "Hot air balloon over the Serengeti",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Nairobi", description: "Arrive at Jomo Kenyatta International Airport. Transfer to your lodge and enjoy a welcome dinner." },
      { day: 2, title: "Amboseli National Park", description: "Drive to Amboseli with views of Mount Kilimanjaro. Afternoon game drive spotting elephants and giraffes." },
      { day: 3, title: "Lake Nakuru", description: "Journey to Lake Nakuru, famous for its flamingo populations and rhino sanctuary." },
      { day: 4, title: "Masai Mara Arrival", description: "Enter the legendary Masai Mara. Afternoon game drive seeking the Big Five." },
      { day: 5, title: "Full Day Safari", description: "Full day in the Mara with morning and afternoon game drives. Visit a Maasai village in the evening." },
      { day: 6, title: "Balloon Safari", description: "Optional hot air balloon ride at dawn over the savanna. Afternoon at leisure or additional game drive." },
      { day: 7, title: "Serengeti Crossing", description: "Cross into Tanzania's Serengeti. Witness the great migration routes and endless golden plains." },
      { day: 8, title: "Departure", description: "Morning nature walk followed by transfer to the airport." },
    ],
    includedItems: ["Safari lodges", "All meals on safari", "Park entry fees", "Professional safari guides"],
    excludedItems: ["International flights", "Visa fees", "Balloon safari upgrade"],
    galleryImages: [africaImg, capetownImg, egyptImg, moroccoImg],
  },
  {
    slug: "japan-spring",
    image: japanImg,
    heroImage: heroJapanImg,
    title: "Japan Spring",
    duration: "7 Days / 6 Nights",
    price: "1,200",
    category: "Nature",
    departure: "April 2026",
    groupSize: "14 Travelers",
    inclusions: "Stay, transport, tours",
    overview: [
      "Experience Japan during its most magical season — cherry blossom time. Walk beneath canopies of pink petals in ancient temple gardens and modern city parks alike.",
      "This journey blends Japan's deep traditions with its cutting-edge modernity for an unforgettable spring experience.",
    ],
    highlights: [
      "Cherry blossom viewing in Kyoto",
      "Traditional tea ceremony experience",
      "Bullet train ride through countryside",
      "Shibuya Crossing and Akihabara culture",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Tokyo", description: "Arrive at Narita Airport, transfer to Shinjuku hotel. Evening walk through the neon-lit streets." },
      { day: 2, title: "Tokyo Exploration", description: "Visit Meiji Shrine, Harajuku, Shibuya Crossing, and Senso-ji Temple in Asakusa." },
      { day: 3, title: "Mount Fuji Day Trip", description: "Day trip to the Fuji Five Lakes region. Stunning views of Japan's iconic mountain reflected in still waters." },
      { day: 4, title: "Bullet Train to Kyoto", description: "Ride the Shinkansen to Kyoto. Afternoon visit to Fushimi Inari Shrine's thousand vermillion torii gates." },
      { day: 5, title: "Kyoto Temples & Gardens", description: "Full day exploring Kinkaku-ji, Arashiyama Bamboo Grove, and the Philosopher's Path under cherry blossoms." },
      { day: 6, title: "Nara & Tea Ceremony", description: "Day trip to Nara to meet the friendly deer. Afternoon traditional Japanese tea ceremony experience." },
      { day: 7, title: "Departure", description: "Morning visit to Nishiki Market for last-minute souvenirs before departure." },
    ],
    includedItems: ["Traditional ryokan & hotels", "Breakfast daily", "Japan Rail Pass", "Guided temple tours"],
    excludedItems: ["International flights", "Lunch & dinner", "Optional activities"],
    galleryImages: [japanImg, tokyoImg, kyotoImg, baliImg],
  },
  {
    slug: "paris-classics",
    image: parisImg,
    heroImage: heroParisImg,
    title: "Paris Classics",
    duration: "6 Days / 5 Nights",
    price: "1,500",
    category: "Romantic",
    departure: "June 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "Fall in love with the City of Light on this curated Parisian journey. From the Eiffel Tower to hidden patisseries, discover the romance and artistry that make Paris legendary.",
      "Every cobblestone street tells a story — of artists, lovers, and revolutionaries who shaped the world.",
    ],
    highlights: [
      "Eiffel Tower sunset champagne",
      "Louvre Museum private guided tour",
      "Seine River evening cruise",
      "Montmartre artist quarter walking tour",
    ],
    itinerary: [
      { day: 1, title: "Bienvenue à Paris", description: "Arrive at Charles de Gaulle, transfer to your Left Bank hotel. Evening stroll along the Seine." },
      { day: 2, title: "Iconic Paris", description: "Visit the Eiffel Tower, Arc de Triomphe, and Champs-Élysées. Sunset champagne on the tower's second floor." },
      { day: 3, title: "Art & Culture", description: "Private guided tour of the Louvre. Afternoon at Musée d'Orsay and the Luxembourg Gardens." },
      { day: 4, title: "Versailles Day Trip", description: "Explore the Palace of Versailles and its magnificent gardens. Return for a Seine dinner cruise." },
      { day: 5, title: "Montmartre & Local Life", description: "Wander Montmartre's artistic streets, visit Sacré-Cœur, and enjoy a cooking class with a local chef." },
      { day: 6, title: "Au Revoir", description: "Final morning at a café with fresh croissants before your departure." },
    ],
    includedItems: ["Boutique hotel", "Daily breakfast", "Museum passes", "Seine cruise ticket"],
    excludedItems: ["Flights", "Travel insurance", "Personal expenses"],
    galleryImages: [parisImg, parisEiffelImg, italyImg, londonImg],
  },
  {
    slug: "paris-getaway",
    image: dubaiImg,
    heroImage: heroParisImg,
    title: "Paris Getaway",
    duration: "5 Days / 4 Nights",
    price: "1,100",
    category: "Adventure",
    departure: "May 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, tours",
    overview: [
      "A quick but deep dive into Paris for the curious traveler. This compact getaway packs in the highlights with time for spontaneous discoveries.",
      "Perfect for first-timers and returning visitors who want to experience the best of Paris in a shorter timeframe.",
    ],
    highlights: [
      "Notre-Dame and Île de la Cité",
      "Le Marais neighborhood exploration",
      "French wine and cheese tasting",
      "Street art tour in Belleville",
    ],
    itinerary: [
      { day: 1, title: "Arrival & First Impressions", description: "Check in and explore the charming Le Marais district. Welcome dinner at a traditional bistro." },
      { day: 2, title: "Classic Landmarks", description: "Eiffel Tower, Notre-Dame (exterior), and a walk along the Left Bank's bookshops." },
      { day: 3, title: "Hidden Paris", description: "Explore covered passages, vintage shops, and lesser-known museums. Evening wine tasting." },
      { day: 4, title: "Art & Markets", description: "Morning at the Louvre, afternoon at a bustling open-air market. Farewell rooftop dinner." },
      { day: 5, title: "Departure", description: "Leisurely breakfast before your airport transfer." },
    ],
    includedItems: ["Central hotel", "Breakfast daily", "Walking tours", "Wine tasting session"],
    excludedItems: ["Flights", "Lunch & dinner", "Museum entries"],
    galleryImages: [dubaiImg, parisImg, parisEiffelImg, londonImg],
  },
  {
    slug: "new-york-tour",
    image: nycImg,
    heroImage: heroNycImg,
    title: "New York Tour",
    duration: "6 Days / 5 Nights",
    price: "1,300",
    category: "Adventure",
    departure: "August 2026",
    groupSize: "14 Travelers",
    inclusions: "Stay, tours, transfers",
    overview: [
      "The city that never sleeps awaits. From Broadway shows to Brooklyn bridges, experience the electric energy of New York City at its finest.",
      "Every borough tells a different story — this tour captures the soul of the Big Apple.",
    ],
    highlights: [
      "Statue of Liberty & Ellis Island",
      "Central Park guided bike tour",
      "Broadway show experience",
      "Brooklyn Bridge sunset walk",
    ],
    itinerary: [
      { day: 1, title: "Welcome to NYC", description: "Arrive at JFK, transfer to your Manhattan hotel. Evening walk through Times Square." },
      { day: 2, title: "Iconic Manhattan", description: "Statue of Liberty ferry, Wall Street, 9/11 Memorial, and a Broadway show." },
      { day: 3, title: "Central Park & Museums", description: "Bike tour through Central Park, visit the Met Museum, and explore the Upper West Side." },
      { day: 4, title: "Brooklyn Adventure", description: "Walk the Brooklyn Bridge, explore DUMBO, enjoy artisan food at Smorgasburg." },
      { day: 5, title: "Culture & Nightlife", description: "SoHo shopping, Greenwich Village jazz club, and rooftop bar with skyline views." },
      { day: 6, title: "Departure", description: "Brunch in the West Village before your airport transfer." },
    ],
    includedItems: ["Manhattan hotel", "Metro passes", "Bike rental", "Broadway ticket"],
    excludedItems: ["Flights", "Most meals", "Shopping expenses"],
    galleryImages: [nycImg, londonImg, singaporeImg, dubaiSkylineImg],
  },
  {
    slug: "paris-trail",
    image: capetownImg,
    heroImage: heroParisImg,
    title: "Paris Trail",
    duration: "6 Days / 5 Nights",
    price: "1,200",
    category: "Romantic",
    departure: "July 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "Trace the romantic trails of Paris through its gardens, riverside paths, and historic quarters. This journey celebrates the art of slow travel.",
      "Discover hidden courtyards, secret gardens, and the quieter side of the world's most romantic city.",
    ],
    highlights: [
      "Tuileries Garden morning walks",
      "Canal Saint-Martin picnic",
      "Père Lachaise Cemetery history",
      "Sunset from Sacré-Cœur steps",
    ],
    itinerary: [
      { day: 1, title: "Arrival & Garden Stroll", description: "Check in to your boutique hotel. Evening stroll through the Tuileries Garden." },
      { day: 2, title: "River & Romance", description: "Seine-side walk, Île Saint-Louis ice cream, and Shakespeare and Company bookshop." },
      { day: 3, title: "Montmartre Trail", description: "Climb to Sacré-Cœur, explore Place du Tertre, and enjoy a vineyard visit in the 18th." },
      { day: 4, title: "Secret Paris", description: "Hidden passages, Canal Saint-Martin, and a picnic with local cheeses and wine." },
      { day: 5, title: "Cultural Farewell", description: "Musée Rodin, Les Invalides, and a farewell dinner cruise on the Seine." },
      { day: 6, title: "Departure", description: "Morning café visit before transfer." },
    ],
    includedItems: ["Boutique hotel", "Breakfast & select meals", "Guided walks", "Seine cruise"],
    excludedItems: ["Flights", "Travel insurance", "Personal expenses"],
    galleryImages: [capetownImg, parisImg, parisEiffelImg, italyImg],
  },
  {
    slug: "bali-cultural-retreat",
    image: baliImg,
    heroImage: heroBaliImg,
    title: "Bali Cultural Retreat",
    duration: "6 Days / 5 Nights",
    price: "950",
    category: "Nature",
    departure: "March 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, meals, experiences",
    overview: [
      "Immerse yourself in Bali's spiritual heart. From terraced rice paddies to sacred water temples, this retreat reconnects you with nature and inner peace.",
      "Experience traditional Balinese healing, organic cooking, and sunrise yoga surrounded by tropical beauty.",
    ],
    highlights: [
      "Tegallalang Rice Terrace walk",
      "Tirta Empul water purification",
      "Ubud Monkey Forest visit",
      "Traditional Balinese dance performance",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Ubud", description: "Transfer to your eco-resort in Ubud. Welcome ceremony and evening meditation session." },
      { day: 2, title: "Rice Terraces & Temples", description: "Morning walk through Tegallalang Rice Terraces. Afternoon at Tirta Empul Temple for a water purification." },
      { day: 3, title: "Art & Spirit", description: "Visit local artisan workshops, Ubud Art Market, and attend a Kecak fire dance at sunset." },
      { day: 4, title: "Volcano Sunrise", description: "Pre-dawn trek to Mount Batur for a spectacular sunrise. Afternoon spa and relaxation." },
      { day: 5, title: "Cooking & Culture", description: "Balinese cooking class using organic ingredients. Afternoon visit to the Sacred Monkey Forest." },
      { day: 6, title: "Departure", description: "Final sunrise yoga session before your airport transfer." },
    ],
    includedItems: ["Eco-resort stay", "All meals", "Yoga sessions", "Cultural tours"],
    excludedItems: ["Flights", "Spa treatments", "Personal expenses"],
    galleryImages: [baliImg, thailandImg, maldivesImg, japanImg],
  },
  {
    slug: "switzerland-explore",
    image: kyotoImg,
    heroImage: heroSwitzerlandImg,
    title: "Switzerland Explore",
    duration: "5 Days / 4 Nights",
    price: "1,500",
    category: "Nature",
    departure: "June 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, transport, tours",
    overview: [
      "Discover Switzerland's breathtaking Alpine landscapes, pristine lakes, and charming villages. This tour captures the essence of Swiss beauty and precision.",
      "From mountaintop panoramas to lakeside serenity, every moment is a postcard come to life.",
    ],
    highlights: [
      "Jungfraujoch — Top of Europe",
      "Lake Lucerne boat cruise",
      "Swiss chocolate workshop",
      "Scenic train through the Alps",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Zurich", description: "Arrive and transfer to Lucerne. Evening lakeside walk and welcome dinner." },
      { day: 2, title: "Alpine Heights", description: "Excursion to Jungfraujoch via cogwheel railway. Panoramic views of the Aletsch Glacier." },
      { day: 3, title: "Lake & Chocolate", description: "Lake Lucerne cruise and visit to a traditional Swiss chocolate factory." },
      { day: 4, title: "Interlaken Adventure", description: "Free day in Interlaken for paragliding, hiking, or simply soaking in mountain views." },
      { day: 5, title: "Departure", description: "Scenic train ride back to Zurich airport." },
    ],
    includedItems: ["Mountain hotels", "Swiss Travel Pass", "Guided excursions", "Chocolate workshop"],
    excludedItems: ["Flights", "Adventure activities", "Personal expenses"],
    galleryImages: [kyotoImg, icelandImg, newzealandImg, australiaImg],
  },
  {
    slug: "switzerland-classic",
    image: icelandImg,
    heroImage: heroSwitzerlandImg,
    title: "Switzerland Classic",
    duration: "5 Days / 4 Nights",
    price: "1,500",
    category: "Nature",
    departure: "July 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, meals, transport",
    overview: [
      "The classic Swiss experience — combining Zurich's cosmopolitan charm with the majesty of the Bernese Alps. A perfectly paced journey through Switzerland's greatest hits.",
      "Enjoy world-class cuisine, pristine nature, and the legendary Swiss hospitality.",
    ],
    highlights: [
      "Zurich Old Town walking tour",
      "Grindelwald mountain village",
      "Swiss fondue dinner experience",
      "Bernese Oberland railway journey",
    ],
    itinerary: [
      { day: 1, title: "Zurich Discovery", description: "Explore Zurich's old town, Bahnhofstrasse, and enjoy lakeside dining." },
      { day: 2, title: "Bern & Beyond", description: "Visit the Swiss capital Bern, its medieval streets, and the Bear Park." },
      { day: 3, title: "Bernese Oberland", description: "Train to Grindelwald. Hike gentle alpine trails with Eiger North Face views." },
      { day: 4, title: "Lakes & Valleys", description: "Lake Thun cruise and visit to the Trümmelbach Falls inside the mountain." },
      { day: 5, title: "Departure", description: "Morning market visit before your transfer." },
    ],
    includedItems: ["Chalet accommodation", "Breakfast & dinner", "Train passes", "Guided tours"],
    excludedItems: ["Flights", "Lunch", "Optional activities"],
    galleryImages: [icelandImg, kyotoImg, newzealandImg, barcelonaImg],
  },
  {
    slug: "japan-begins-tour",
    image: tokyoImg,
    heroImage: heroJapanImg,
    title: "Japan Begins Tour",
    duration: "7 Days / 6 Nights",
    price: "1,000",
    category: "Adventure",
    departure: "May 2026",
    groupSize: "16 Travelers",
    inclusions: "Stay, transport, tours",
    overview: [
      "Your perfect first visit to Japan. This tour introduces the essential experiences — from Tokyo's electric energy to Kyoto's serene temples — at a pace that lets you truly absorb it all.",
      "A blend of guided experiences and free time ensures you see the must-sees while discovering your own Japan.",
    ],
    highlights: [
      "Tsukiji Outer Market food tour",
      "Shinkansen bullet train experience",
      "Hiroshima Peace Memorial",
      "Osaka street food adventure",
    ],
    itinerary: [
      { day: 1, title: "Tokyo Arrival", description: "Welcome to Japan. Transfer to your hotel and explore the Shinjuku neighborhood." },
      { day: 2, title: "Tokyo Must-Sees", description: "Tsukiji Market, TeamLab exhibition, and Akihabara's anime culture." },
      { day: 3, title: "Hakone Retreat", description: "Day trip to Hakone — hot springs, Lake Ashi cruise, and Mount Fuji views." },
      { day: 4, title: "Kyoto Temples", description: "Bullet train to Kyoto. Visit Kinkaku-ji and the bamboo grove." },
      { day: 5, title: "Hiroshima & Miyajima", description: "Day trip to Hiroshima Peace Park and the floating torii gate of Miyajima Island." },
      { day: 6, title: "Osaka Food Tour", description: "Explore Osaka's Dotonbori district. Street food tour including takoyaki and okonomiyaki." },
      { day: 7, title: "Departure", description: "Morning free time in Osaka before your flight home." },
    ],
    includedItems: ["Hotels", "Breakfast daily", "Rail pass", "Guided city tours"],
    excludedItems: ["International flights", "Most meals", "Optional experiences"],
    galleryImages: [tokyoImg, japanImg, kyotoImg, baliImg],
  },
  {
    slug: "india-heritage-culture",
    image: peruImg,
    heroImage: heroPeruImg,
    title: "India Heritage & Culture",
    duration: "8 Days / 7 Nights",
    price: "1,300",
    category: "Adventure",
    departure: "December 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, meals, guides",
    overview: [
      "Journey through India's Golden Triangle and beyond — a land where ancient heritage meets vibrant daily life. From the Taj Mahal to Rajasthan's mighty forts, every stop is awe-inspiring.",
      "This immersive experience connects you with India's art, spirituality, and legendary hospitality.",
    ],
    highlights: [
      "Taj Mahal at sunrise",
      "Jaipur's Amber Fort elephant ride",
      "Delhi's old spice markets",
      "Varanasi Ganges ceremony",
    ],
    itinerary: [
      { day: 1, title: "Delhi Arrival", description: "Welcome to India. Transfer to your heritage hotel and evening rickshaw tour of Old Delhi." },
      { day: 2, title: "Delhi Exploration", description: "Visit Humayun's Tomb, Qutub Minar, and India Gate. Evening at Chandni Chowk market." },
      { day: 3, title: "Agra & Taj Mahal", description: "Drive to Agra for a sunrise visit to the Taj Mahal. Afternoon at Agra Fort." },
      { day: 4, title: "Jaipur Pink City", description: "Journey to Jaipur. Explore the City Palace and Hawa Mahal." },
      { day: 5, title: "Amber Fort & Culture", description: "Morning at Amber Fort. Afternoon block-printing workshop and local cooking class." },
      { day: 6, title: "Udaipur Lake City", description: "Fly to Udaipur. Boat ride on Lake Pichola and visit the City Palace." },
      { day: 7, title: "Udaipur Heritage", description: "Explore Udaipur's gardens, temples, and artisan quarters. Farewell dinner at a lakeside restaurant." },
      { day: 8, title: "Departure", description: "Morning transfer to the airport." },
    ],
    includedItems: ["Heritage hotels", "All meals", "Private guides", "Monument entries"],
    excludedItems: ["International flights", "Visa fees", "Personal expenses"],
    galleryImages: [peruImg, dubaiImg, egyptImg, moroccoImg],
  },
  {
    slug: "switzerland-natures",
    image: barcelonaImg,
    heroImage: heroSwitzerlandImg,
    title: "Switzerland Nature's",
    duration: "5 Days / 4 Nights",
    price: "1,500",
    category: "Nature",
    departure: "August 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, transport, tours",
    overview: [
      "This nature-focused Swiss journey takes you deep into the alpine wilderness — crystal-clear lakes, towering peaks, and wildflower meadows stretching to the horizon.",
      "Ideal for nature lovers seeking tranquility and adventure in equal measure.",
    ],
    highlights: [
      "Lauterbrunnen Valley hike",
      "Oeschinen Lake alpine swim",
      "Glacier Express scenic ride",
      "Swiss alpine cheese farm visit",
    ],
    itinerary: [
      { day: 1, title: "Arrival & Alpine Air", description: "Arrive and transfer to Lauterbrunnen Valley. Evening walk among the 72 waterfalls." },
      { day: 2, title: "Valley of Waterfalls", description: "Full day hiking the Lauterbrunnen trails. Visit Staubbach Falls and Trümmelbach Falls." },
      { day: 3, title: "Alpine Lake Day", description: "Cable car to Oeschinen Lake. Swimming, kayaking, and alpine picnic." },
      { day: 4, title: "Mountain Railway", description: "Scenic train through the Swiss Alps. Visit a traditional cheese-making farm." },
      { day: 5, title: "Departure", description: "Morning nature walk before your transfer." },
    ],
    includedItems: ["Mountain lodge", "Breakfast & dinner", "Transport passes", "Guided hikes"],
    excludedItems: ["Flights", "Lunch", "Equipment rental"],
    galleryImages: [barcelonaImg, icelandImg, newzealandImg, kyotoImg],
  },
  {
    slug: "japan-nature",
    image: maldivesImg,
    heroImage: heroJapanImg,
    title: "Japan Nature",
    duration: "7 Days / 6 Nights",
    price: "1,200",
    category: "Nature",
    departure: "October 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, transport, tours",
    overview: [
      "Discover Japan beyond the cities — volcanic hot springs, ancient forests, and coastal trails that reveal the country's deep connection to nature.",
      "From Yakushima's primeval forests to the Japanese Alps, this journey celebrates the natural side of Japan.",
    ],
    highlights: [
      "Yakushima ancient cedar forest",
      "Japanese Alps mountain trail",
      "Natural onsen hot springs",
      "Kumano Kodo pilgrimage path",
    ],
    itinerary: [
      { day: 1, title: "Osaka Arrival", description: "Arrive and settle in. Evening at Osaka's vibrant Dotonbori." },
      { day: 2, title: "Kumano Kodo Trail", description: "Begin walking the ancient Kumano Kodo pilgrimage route through sacred forests." },
      { day: 3, title: "Hot Spring Village", description: "Continue the trail to a traditional onsen village. Evening soak in natural hot springs." },
      { day: 4, title: "Japanese Alps", description: "Travel to Kamikochi in the Northern Alps. Hike along crystal-clear mountain rivers." },
      { day: 5, title: "Alpine Exploration", description: "Full day in the Japanese Alps. Visit Matsumoto Castle." },
      { day: 6, title: "Yakushima Island", description: "Fly to Yakushima. Trek through moss-covered forests of thousand-year-old cedar trees." },
      { day: 7, title: "Departure", description: "Morning beach walk on Yakushima before your departure." },
    ],
    includedItems: ["Ryokan & eco-lodges", "Breakfast & dinner", "Domestic flights", "Trail guides"],
    excludedItems: ["International flights", "Lunch", "Equipment"],
    galleryImages: [maldivesImg, japanImg, baliImg, thailandImg],
  },
  {
    slug: "paris-begins",
    image: heroImg,
    heroImage: heroParisImg,
    title: "Paris Begins",
    duration: "6 Days / 5 Nights",
    price: "1,500",
    category: "Romantic",
    departure: "September 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "Your first chapter in Paris — a carefully crafted introduction to the city's most enchanting experiences. Every day reveals a new layer of Parisian magic.",
      "From croissant-filled mornings to starlit Seine walks, this journey makes Paris feel like home.",
    ],
    highlights: [
      "Private Eiffel Tower experience",
      "Latin Quarter food walk",
      "Monet's Garden day trip",
      "Parisian perfume workshop",
    ],
    itinerary: [
      { day: 1, title: "Welcome to Paris", description: "Arrive and settle into your charming Marais hotel. Evening Seine walk." },
      { day: 2, title: "Essential Paris", description: "Eiffel Tower, Champ de Mars, and an evening at a classic Parisian cabaret." },
      { day: 3, title: "Art & Gardens", description: "Louvre highlights tour, Tuileries Garden, and Orangerie Museum." },
      { day: 4, title: "Giverny Day Trip", description: "Visit Monet's house and gardens in Giverny. The water lily ponds in person." },
      { day: 5, title: "Local Parisian Life", description: "Latin Quarter food tour, perfume workshop, and farewell dinner at a Michelin bistro." },
      { day: 6, title: "Departure", description: "Final patisserie visit before your transfer." },
    ],
    includedItems: ["Boutique hotel", "Daily breakfast & select dinners", "Museum passes", "Day trip transport"],
    excludedItems: ["Flights", "Travel insurance", "Shopping"],
    galleryImages: [heroImg, parisImg, parisEiffelImg, londonImg],
  },
  {
    slug: "australia-coastline",
    image: australiaImg,
    title: "Australia Coastline",
    duration: "7 Days / 6 Nights",
    price: "1,800",
    category: "Nature",
    departure: "January 2027",
    groupSize: "12 Travelers",
    inclusions: "Stay, tours, transfers",
    overview: [
      "Explore Australia's stunning coastline from Sydney's harbor to the Great Ocean Road's dramatic cliffs. Sun, surf, and wildlife await at every turn.",
      "This coastal adventure combines iconic landmarks with hidden beaches and unique Australian wildlife encounters.",
    ],
    highlights: [
      "Sydney Harbour Bridge climb",
      "Great Ocean Road drive",
      "Kangaroo Island wildlife",
      "Great Barrier Reef snorkeling",
    ],
    itinerary: [
      { day: 1, title: "Sydney Arrival", description: "Welcome to Australia. Transfer to your harbourside hotel and Circular Quay walk." },
      { day: 2, title: "Sydney Icons", description: "Sydney Opera House tour, Harbour Bridge climb, and Bondi Beach coastal walk." },
      { day: 3, title: "Blue Mountains", description: "Day trip to the Blue Mountains. Scenic World rides and bushwalking." },
      { day: 4, title: "Great Ocean Road", description: "Fly to Melbourne, drive the Great Ocean Road. See the Twelve Apostles at sunset." },
      { day: 5, title: "Wildlife Encounters", description: "Visit a wildlife sanctuary. See koalas, kangaroos, and wombats up close." },
      { day: 6, title: "Reef Experience", description: "Fly to Cairns for a Great Barrier Reef snorkeling or diving excursion." },
      { day: 7, title: "Departure", description: "Morning at the beach before your departure." },
    ],
    includedItems: ["Hotels", "Domestic flights", "Tour entries", "Reef excursion"],
    excludedItems: ["International flights", "Most meals", "Diving upgrades"],
    galleryImages: [australiaImg, sydneyImg, newzealandImg, maldivesImg],
  },
  {
    slug: "sydney-highlights",
    image: sydneyImg,
    title: "Sydney Highlights",
    duration: "6 Days / 5 Nights",
    price: "1,650",
    category: "Adventure",
    departure: "February 2027",
    groupSize: "14 Travelers",
    inclusions: "Stay, tours, meals",
    overview: [
      "Dive deep into Sydney's vibrant culture — from world-famous landmarks to hidden laneways, beachside brunches to harbor sunsets.",
      "This tour showcases why Sydney is consistently ranked among the world's most livable and exciting cities.",
    ],
    highlights: [
      "Opera House backstage tour",
      "Bondi to Coogee coastal walk",
      "Taronga Zoo ferry visit",
      "The Rocks historic pub crawl",
    ],
    itinerary: [
      { day: 1, title: "Welcome to Sydney", description: "Arrive and settle in. Evening harbor ferry ride with skyline views." },
      { day: 2, title: "Iconic Sydney", description: "Opera House backstage tour, The Rocks walking tour, and harbour lunch." },
      { day: 3, title: "Coastal Adventure", description: "Bondi to Coogee coastal walk with stunning ocean views and cliff-top cafés." },
      { day: 4, title: "Wildlife & Nature", description: "Ferry to Taronga Zoo. Afternoon at Manly Beach." },
      { day: 5, title: "Culture & Food", description: "Explore Surry Hills cafés, galleries, and Sydney's multicultural food scene." },
      { day: 6, title: "Departure", description: "Beachside breakfast before your transfer." },
    ],
    includedItems: ["Harbor hotel", "Ferry passes", "Tour tickets", "Welcome dinner"],
    excludedItems: ["Flights", "Most meals", "Personal expenses"],
    galleryImages: [sydneyImg, australiaImg, singaporeImg, nycImg],
  },
  {
    slug: "discover-egypt",
    image: egyptImg,
    title: "Discover Egypt",
    duration: "6 Days / 5 Nights",
    price: "1,050",
    category: "Adventure",
    departure: "November 2026",
    groupSize: "15 Travelers",
    inclusions: "Stay, meals, guides",
    overview: [
      "Walk in the footsteps of pharaohs on this epic Egyptian adventure. From the Great Pyramids to the Valley of the Kings, 5,000 years of history unfolds before your eyes.",
      "Cruise the Nile at sunset, explore ancient tombs, and marvel at monuments that have stood for millennia.",
    ],
    highlights: [
      "Pyramids of Giza & the Sphinx",
      "Nile River sunset cruise",
      "Valley of the Kings exploration",
      "Egyptian Museum treasures",
    ],
    itinerary: [
      { day: 1, title: "Cairo Arrival", description: "Welcome to Egypt. Transfer to your hotel near the pyramids." },
      { day: 2, title: "Pyramids & Sphinx", description: "Full day at the Giza Plateau — Great Pyramids, Sphinx, and Solar Boat Museum." },
      { day: 3, title: "Egyptian Museum & Old Cairo", description: "Visit the Egyptian Museum's King Tut collection. Explore Coptic Cairo and Khan el-Khalili bazaar." },
      { day: 4, title: "Luxor Flight", description: "Fly to Luxor. Visit Karnak Temple and Luxor Temple. Evening Nile cruise begins." },
      { day: 5, title: "Valley of the Kings", description: "Cross the Nile to explore the Valley of the Kings, Hatshepsut Temple, and Colossi of Memnon." },
      { day: 6, title: "Departure", description: "Final Nile sunrise before your transfer." },
    ],
    includedItems: ["Hotels & Nile cruise", "All meals", "Egyptologist guide", "Domestic flight"],
    excludedItems: ["International flights", "Visa", "Optional tomb entries"],
    galleryImages: [egyptImg, moroccoImg, dubaiImg, africaImg],
  },
  {
    slug: "rome-heritage-tour",
    image: romeImg,
    title: "Rome Heritage Tour",
    duration: "5 Days / 4 Nights",
    price: "1,350",
    category: "Romantic",
    departure: "October 2026",
    groupSize: "12 Travelers",
    inclusions: "Stay, tours, meals",
    overview: [
      "The Eternal City awaits with 2,800 years of layered history, world-class cuisine, and la dolce vita lifestyle. This tour brings Rome's heritage to vivid life.",
      "From gladiator arenas to hidden trattorias, every corner reveals another chapter of Rome's extraordinary story.",
    ],
    highlights: [
      "Vatican Museums & Sistine Chapel",
      "Underground Rome catacombs",
      "Trastevere food walking tour",
      "Sunset at the Spanish Steps",
    ],
    itinerary: [
      { day: 1, title: "Benvenuti a Roma", description: "Arrive and transfer to your hotel near Piazza Navona. Evening passeggiata." },
      { day: 2, title: "Ancient Rome", description: "Colosseum VIP entrance, Roman Forum, and Palatine Hill. Afternoon gelato tour." },
      { day: 3, title: "Vatican Day", description: "Early access Vatican Museums, Sistine Chapel, and St. Peter's Basilica." },
      { day: 4, title: "Hidden Rome", description: "Underground catacombs, Trastevere food tour, and sunset from Pincian Hill." },
      { day: 5, title: "Arrivederci", description: "Morning at the Trevi Fountain before departure." },
    ],
    includedItems: ["Boutique hotel", "Breakfast & select meals", "Skip-the-line entries", "Expert guides"],
    excludedItems: ["Flights", "Travel insurance", "Personal expenses"],
    galleryImages: [romeImg, italyImg, amalfiImg, santoriniImg],
  },
  {
    slug: "santorini-escape",
    image: santoriniImg,
    title: "Santorini Escape",
    duration: "5 Days / 4 Nights",
    price: "1,750",
    category: "Romantic",
    departure: "August 2026",
    groupSize: "8 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "Lose yourself in the iconic blue domes and sunset skies of Santorini. This intimate escape pairs luxury with authentic Greek island life.",
      "Watch the world's most famous sunset from Oia, taste volcanic wines, and swim in crystal-clear Aegean waters.",
    ],
    highlights: [
      "Oia sunset experience",
      "Volcanic wine tasting tour",
      "Caldera sailing cruise",
      "Red Beach & Akrotiri ruins",
    ],
    itinerary: [
      { day: 1, title: "Island Arrival", description: "Arrive by ferry or flight. Transfer to your cliffside cave hotel in Oia." },
      { day: 2, title: "Caldera Cruise", description: "Full day sailing cruise around the caldera. Swim in hot springs and visit the volcano." },
      { day: 3, title: "Wine & History", description: "Visit Akrotiri archaeological site. Afternoon volcanic wine tasting tour." },
      { day: 4, title: "Beach & Leisure", description: "Morning at Red Beach. Afternoon free for spa or exploring Fira. Farewell dinner." },
      { day: 5, title: "Departure", description: "Sunrise over the caldera before your transfer." },
    ],
    includedItems: ["Cave hotel", "Daily breakfast & dinner", "Sailing cruise", "Wine tour"],
    excludedItems: ["Flights/ferries", "Lunch", "Spa treatments"],
    galleryImages: [santoriniImg, amalfiImg, romeImg, italyImg],
  },
  {
    slug: "singapore-city-tour",
    image: singaporeImg,
    title: "Singapore City Tour",
    duration: "4 Days / 3 Nights",
    price: "1,100",
    category: "Adventure",
    departure: "September 2026",
    groupSize: "14 Travelers",
    inclusions: "Stay, tours, meals",
    overview: [
      "Discover the Lion City's perfect blend of futuristic architecture, lush gardens, and mouth-watering street food. Singapore packs incredible experiences into a compact island.",
      "From Marina Bay's dazzling skyline to hawker centres serving Michelin-starred dishes, this city tour is a feast for all senses.",
    ],
    highlights: [
      "Gardens by the Bay light show",
      "Hawker centre food crawl",
      "Marina Bay Sands SkyPark",
      "Sentosa Island adventure",
    ],
    itinerary: [
      { day: 1, title: "Welcome to Singapore", description: "Arrive at Changi. Transfer to Marina Bay. Evening Garden Rhapsody light show." },
      { day: 2, title: "City Highlights", description: "Marina Bay Sands, Chinatown, Little India, and a hawker centre food crawl." },
      { day: 3, title: "Nature & Fun", description: "Gardens by the Bay Cloud Forest, Sentosa Island, and evening Clarke Quay dining." },
      { day: 4, title: "Departure", description: "Morning at the Botanic Gardens before your flight." },
    ],
    includedItems: ["Marina Bay hotel", "Attraction passes", "Food tour", "Airport transfers"],
    excludedItems: ["Flights", "Shopping", "Optional activities"],
    galleryImages: [singaporeImg, dubaiSkylineImg, tokyoImg, baliImg],
  },
  {
    slug: "dubai-skyline-tour",
    image: dubaiSkylineImg,
    title: "Dubai Skyline Tour",
    duration: "5 Days / 4 Nights",
    price: "1,400",
    category: "Adventure",
    departure: "January 2027",
    groupSize: "12 Travelers",
    inclusions: "Stay, tours, desert safari",
    overview: [
      "Experience the dazzling contrasts of Dubai — from the world's tallest building to vast golden deserts. This tour showcases the emirate's ambition and Bedouin heritage.",
      "Luxury, adventure, and culture collide in this city of superlatives.",
    ],
    highlights: [
      "Burj Khalifa observation deck",
      "Desert safari & dune bashing",
      "Dubai Marina yacht dinner",
      "Gold Souk & spice market",
    ],
    itinerary: [
      { day: 1, title: "Dubai Arrival", description: "Transfer to your hotel on Jumeirah Beach. Evening walk along The Walk at JBR." },
      { day: 2, title: "Modern Dubai", description: "Burj Khalifa At the Top, Dubai Mall, and the Dubai Fountain show." },
      { day: 3, title: "Desert Adventure", description: "Morning desert safari with dune bashing, camel rides, and a BBQ dinner under the stars." },
      { day: 4, title: "Old & New", description: "Explore the historic Al Fahidi district, Gold Souk, and cruise through Dubai Marina." },
      { day: 5, title: "Departure", description: "Morning beach time before your airport transfer." },
    ],
    includedItems: ["Beach resort", "Desert safari", "Burj Khalifa tickets", "Marina cruise"],
    excludedItems: ["Flights", "Shopping", "Premium experiences"],
    galleryImages: [dubaiSkylineImg, dubaiMarinaImg, dubaiImg, egyptImg],
  },
  {
    slug: "amalfi-coast-dream",
    image: amalfiImg,
    title: "Amalfi Coast Dream",
    duration: "6 Days / 5 Nights",
    price: "1,900",
    category: "Romantic",
    departure: "July 2026",
    groupSize: "10 Travelers",
    inclusions: "Stay, meals, boat tours",
    overview: [
      "Wind along the most beautiful coastline in the world — colorful cliffside villages, azure waters, and the scent of lemon groves in the Mediterranean air.",
      "This dreamy coastal journey combines Italian glamour with authentic southern charm.",
    ],
    highlights: [
      "Positano cliffside village",
      "Capri Blue Grotto boat tour",
      "Limoncello tasting experience",
      "Path of the Gods hiking trail",
    ],
    itinerary: [
      { day: 1, title: "Amalfi Arrival", description: "Transfer from Naples to your cliffside hotel in Positano." },
      { day: 2, title: "Positano & Amalfi", description: "Explore Positano's colorful streets, then boat to Amalfi town and its cathedral." },
      { day: 3, title: "Capri Island", description: "Full day on Capri. Visit the Blue Grotto, Gardens of Augustus, and Anacapri." },
      { day: 4, title: "Path of the Gods", description: "Hike the legendary trail with panoramic coastal views. Afternoon in Ravello's gardens." },
      { day: 5, title: "Lemon Groves & Cooking", description: "Visit a lemon farm, make limoncello, and enjoy a cooking class with a local nonna." },
      { day: 6, title: "Departure", description: "Final terrace breakfast overlooking the coast." },
    ],
    includedItems: ["Cliffside hotel", "Breakfast & dinner", "Boat tours", "Cooking class"],
    excludedItems: ["Flights", "Lunch", "Blue Grotto entry"],
    galleryImages: [amalfiImg, italyImg, santoriniImg, romeImg],
  },
  {
    slug: "thailand-paradise",
    image: thailandImg,
    title: "Thailand Paradise",
    duration: "7 Days / 6 Nights",
    price: "950",
    category: "Nature",
    departure: "December 2026",
    groupSize: "14 Travelers",
    inclusions: "Stay, meals, tours",
    overview: [
      "From Bangkok's golden temples to crystal-clear island waters, Thailand enchants every traveler with its warmth, flavor, and natural beauty.",
      "This paradise tour combines cultural immersion with tropical relaxation for the ultimate Thai experience.",
    ],
    highlights: [
      "Grand Palace & Wat Pho",
      "Phi Phi Islands boat tour",
      "Thai cooking class in Chiang Mai",
      "Floating market experience",
    ],
    itinerary: [
      { day: 1, title: "Bangkok Arrival", description: "Welcome to the Land of Smiles. Transfer to your riverside hotel." },
      { day: 2, title: "Temple Tour", description: "Grand Palace, Wat Pho's reclining Buddha, and Wat Arun at sunset." },
      { day: 3, title: "Floating Markets", description: "Morning at Damnoen Saduak floating market. Afternoon Chinatown food tour." },
      { day: 4, title: "Chiang Mai Culture", description: "Fly to Chiang Mai. Visit Doi Suthep temple and evening night bazaar." },
      { day: 5, title: "Cooking & Elephants", description: "Morning Thai cooking class. Afternoon ethical elephant sanctuary visit." },
      { day: 6, title: "Island Paradise", description: "Fly to Phuket. Speed boat to Phi Phi Islands for snorkeling and beach time." },
      { day: 7, title: "Departure", description: "Morning beach yoga before your departure." },
    ],
    includedItems: ["Hotels & resort", "Domestic flights", "All tours", "Cooking class"],
    excludedItems: ["International flights", "Some meals", "Water sports"],
    galleryImages: [thailandImg, baliImg, maldivesImg, singaporeImg],
  },
  {
    slug: "dubai-marina-luxury",
    image: dubaiMarinaImg,
    title: "Dubai Marina Luxury",
    duration: "5 Days / 4 Nights",
    price: "1,600",
    category: "Adventure",
    departure: "February 2027",
    groupSize: "8 Travelers",
    inclusions: "Stay, dining, experiences",
    overview: [
      "The ultimate luxury Dubai experience centered around the glittering Marina district. World-class dining, private yacht cruises, and exclusive experiences define this premium tour.",
      "For travelers who appreciate the finer things — this is Dubai at its most glamorous.",
    ],
    highlights: [
      "Private yacht sunset cruise",
      "Michelin-star dining experience",
      "Palm Jumeirah helicopter tour",
      "Luxury desert glamping",
    ],
    itinerary: [
      { day: 1, title: "Luxury Arrival", description: "Private transfer to your Marina penthouse suite. Welcome champagne on the terrace." },
      { day: 2, title: "Marina & Palm", description: "Marina walk, Atlantis Aquaventure, and afternoon tea at Burj Al Arab." },
      { day: 3, title: "Sky & Sea", description: "Morning helicopter tour over Palm Jumeirah. Evening private yacht dinner cruise." },
      { day: 4, title: "Desert Glamping", description: "Luxury desert camp experience with gourmet dinner and stargazing." },
      { day: 5, title: "Departure", description: "Spa morning before your private airport transfer." },
    ],
    includedItems: ["Luxury suite", "All gourmet meals", "Private transfers", "Premium experiences"],
    excludedItems: ["Flights", "Shopping", "Spa add-ons"],
    galleryImages: [dubaiMarinaImg, dubaiSkylineImg, dubaiImg, maldivesImg],
  },
  {
    slug: "new-zealand-explorer",
    image: newzealandImg,
    title: "New Zealand Explorer",
    duration: "8 Days / 7 Nights",
    price: "2,100",
    category: "Nature",
    departure: "March 2027",
    groupSize: "10 Travelers",
    inclusions: "Stay, transport, tours",
    overview: [
      "From the geothermal wonders of the North Island to the dramatic fjords of the South, New Zealand is a nature lover's dream destination.",
      "This comprehensive explorer tour covers the best of both islands — adventure, scenery, and Māori culture.",
    ],
    highlights: [
      "Milford Sound fjord cruise",
      "Hobbiton movie set tour",
      "Tongariro Alpine Crossing",
      "Queenstown adventure capital",
    ],
    itinerary: [
      { day: 1, title: "Auckland Arrival", description: "Welcome to Aotearoa. Sky Tower visit and Viaduct Harbour dinner." },
      { day: 2, title: "Hobbiton & Rotorua", description: "Morning at the Hobbiton movie set. Afternoon Rotorua geothermal park and Māori cultural show." },
      { day: 3, title: "Tongariro Crossing", description: "One of the world's great day walks through volcanic terrain and emerald lakes." },
      { day: 4, title: "Fly to South Island", description: "Fly to Queenstown. Settle in and explore this lakeside adventure town." },
      { day: 5, title: "Milford Sound", description: "Day cruise through Milford Sound's dramatic fjords, waterfalls, and wildlife." },
      { day: 6, title: "Queenstown Adventure", description: "Choose your thrill — bungee jumping, jet boating, or scenic helicopter flight." },
      { day: 7, title: "Wanaka & Glaciers", description: "Drive to Wanaka, visit the famous lone tree, and hike to Rob Roy Glacier." },
      { day: 8, title: "Departure", description: "Final morning lake walk before your flight home." },
    ],
    includedItems: ["Lodges & hotels", "Domestic flight", "Activity passes", "Guided excursions"],
    excludedItems: ["International flights", "Most meals", "Optional adventures"],
    galleryImages: [newzealandImg, australiaImg, icelandImg, kyotoImg],
  },
  {
    slug: "london-classics",
    image: londonImg,
    title: "London Classics",
    duration: "5 Days / 4 Nights",
    price: "1,250",
    category: "Adventure",
    departure: "June 2026",
    groupSize: "14 Travelers",
    inclusions: "Stay, tours, transport",
    overview: [
      "Experience the best of London — where centuries of royal history meet cutting-edge culture, theatre, and world-class cuisine.",
      "From Buckingham Palace to Camden Market, this tour reveals why London remains one of the world's most captivating cities.",
    ],
    highlights: [
      "Tower of London Crown Jewels",
      "West End theatre performance",
      "Camden & Borough Market food",
      "Thames River evening cruise",
    ],
    itinerary: [
      { day: 1, title: "London Calling", description: "Arrive and transfer to your hotel in Covent Garden. Evening Thames walk." },
      { day: 2, title: "Royal London", description: "Buckingham Palace, Westminster Abbey, Big Ben, and Tower of London." },
      { day: 3, title: "Culture & Markets", description: "British Museum, Borough Market food tour, and evening West End show." },
      { day: 4, title: "Modern London", description: "Tate Modern, Sky Garden views, Camden Market, and a pub dinner." },
      { day: 5, title: "Departure", description: "Morning in a Notting Hill café before your transfer." },
    ],
    includedItems: ["Central hotel", "Oyster card", "Theatre ticket", "Guided tours"],
    excludedItems: ["Flights", "Most meals", "Shopping"],
    galleryImages: [londonImg, parisImg, barcelonaImg, nycImg],
  },
  {
    slug: "paris-romantic-getaway",
    image: parisEiffelImg,
    title: "Paris Romantic Getaway",
    duration: "4 Days / 3 Nights",
    price: "1,350",
    category: "Romantic",
    departure: "February 2027",
    groupSize: "8 Travelers",
    inclusions: "Stay, meals, experiences",
    overview: [
      "The most romantic short escape imaginable — designed for couples seeking Parisian magic. Intimate dinners, private tours, and unforgettable moments at every turn.",
      "Let Paris cast its spell on you with this carefully curated romantic experience.",
    ],
    highlights: [
      "Private Eiffel Tower dinner",
      "Couples Seine river cruise",
      "Champagne at sunset",
      "Montmartre love locks walk",
    ],
    itinerary: [
      { day: 1, title: "Love in Paris", description: "Arrive and check into your romantic Île Saint-Louis hotel. Evening Seine champagne cruise." },
      { day: 2, title: "Romance & Art", description: "Private Louvre tour, Luxembourg Gardens stroll, and dinner in a candlelit restaurant." },
      { day: 3, title: "Montmartre Magic", description: "Montmartre walking tour, portrait session at Place du Tertre, and Sacré-Cœur sunset." },
      { day: 4, title: "Au Revoir", description: "Breakfast in bed before your departure." },
    ],
    includedItems: ["Romantic boutique hotel", "Champagne cruise", "Private tours", "Gourmet dinners"],
    excludedItems: ["Flights", "Daytime meals", "Shopping"],
    galleryImages: [parisEiffelImg, parisImg, italyImg, santoriniImg],
  },
];

export function getTourBySlug(slug: string): TourData | undefined {
  return allTours.find((t) => t.slug === slug);
}

export function getSimilarTours(currentSlug: string, category: string, count = 4): TourData[] {
  return allTours
    .filter((t) => t.slug !== currentSlug)
    .sort((a, b) => (a.category === category ? -1 : 1) - (b.category === category ? -1 : 1))
    .slice(0, count);
}
