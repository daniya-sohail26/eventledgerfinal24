import React, { useState } from "react";
import { Calendar, MapPin, Ticket } from "lucide-react";

const dummyEvents = [
  {
    id: 1,
    name: "Techno Festival 2025",
    location: "Berlin, Germany",
    date: "June 15, 2025",
    price: "$49",
    category: "Music",
    image: "/img/contact-1.webp",
  },
  {
    id: 2,
    name: "Blockchain Summit",
    location: "New York, USA",
    date: "July 22, 2025",
    price: "$129",
    category: "Tech",
    image: "/img/swordman.webp",
  },
  {
    id: 3,
    name: "Anime & Cosplay Expo",
    location: "Tokyo, Japan",
    date: "Aug 10, 2025",
    price: "$39",
    category: "Culture",
    image: "/img/resell.png",
  },
  {
    id: 4,
    name: "Jazz Nights",
    location: "New Orleans, USA",
    date: "May 5, 2025",
    price: "$59",
    category: "Music",
    image: "/img/entrance.jpg",
  },
  {
    id: 5,
    name: "AI World Forum",
    location: "San Francisco, USA",
    date: "Sept 18, 2025",
    price: "$199",
    category: "Tech",
    image: "/img/stones.webp",
  },
  {
    id: 1,
    name: "Techno Festival 2025",
    location: "Berlin, Germany",
    date: "June 15, 2025",
    price: "$49",
    category: "Music",
    image: "/img/contact-1.webp",
  },
  {
    id: 2,
    name: "Blockchain Summit",
    location: "New York, USA",
    date: "July 22, 2025",
    price: "$129",
    category: "Tech",
    image: "/img/swordman.webp",
  },
  {
    id: 3,
    name: "Anime & Cosplay Expo",
    location: "Tokyo, Japan",
    date: "Aug 10, 2025",
    price: "$39",
    category: "Culture",
    image: "/img/resell.png",
  },
  {
    id: 4,
    name: "Jazz Nights",
    location: "New Orleans, USA",
    date: "May 5, 2025",
    price: "$59",
    category: "Music",
    image: "/img/entrance.jpg",
  },
  {
    id: 5,
    name: "AI World Forum",
    location: "San Francisco, USA",
    date: "Sept 18, 2025",
    price: "$199",
    category: "Tech",
    image: "/img/stones.webp",
  },
];

const categories = ["All", "Music", "Tech", "Culture"];

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEvents =
    selectedCategory === "All"
      ? dummyEvents
      : dummyEvents.filter((event) => event.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-28 px-6">
      <h1 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-500 to-indigo-400 mb-20 animate-fade-in">
        Explore Upcoming Events
      </h1>

      <div className="flex justify-center gap-4 mb-14 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 border tracking-wide shadow-md ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "bg-black/40 text-purple-300 border-purple-800 hover:border-purple-500 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 max-w-7xl mx-auto">
        {filteredEvents.map((event, i) => (
          <div
            key={event.id}
            className={`relative group border border-purple-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-[1.03] hover:shadow-purple-800/50 ${
              i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
            }`}
          >
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 opacity-30 blur-xl rounded-3xl group-hover:opacity-60"></div>

            <img
              src={event.image}
              alt={event.name}
              className="w-full h-52 object-cover rounded-t-3xl border-b border-purple-700/40"
            />

            <div className="relative p-5 z-10 text-purple-200">
              <h2 className="text-xl font-bold mb-2 text-pink-300 tracking-wide">
                {event.name}
              </h2>
              <div className="flex items-center text-sm space-x-2 mb-1 text-purple-400">
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-sm space-x-2 text-purple-400">
                <Calendar size={16} />
                <span>{event.date}</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-pink-400">
                  {event.price}
                </span>
                <button className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 transition-all text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md hover:scale-105">
                  <Ticket size={18} />
                  <span>Buy</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <p className="text-center text-purple-400 mt-20 text-xl">
          No events found in this category.
        </p>
      )}
    </div>
  );
};

export default ProductsPage;
