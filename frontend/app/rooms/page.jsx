"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Star, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/rooms").then(data => {
      setRooms(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-950 text-white py-6 md:py-8 px-4 md:px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-yellow-500">Our Rooms & Suites</h1>
            <p className="text-xs md:text-sm text-gray-400">Select your perfect escape</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-6 mt-6 md:mt-12">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div></div>
        ) : (
          /* CHANGED: grid-cols-2 for mobile, gap-3 for tight spacing */
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {rooms.map((room, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={room.id} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100"
              >
                {/* Reduced height for mobile (h-40) */}
                <div className="relative h-40 md:h-64 overflow-hidden">
                  <img src={room.image_url} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Smaller badge for mobile */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold flex items-center gap-1 text-gray-800 shadow-sm">
                    <Star size={10} className="text-yellow-500 fill-yellow-500 md:w-3.5 md:h-3.5" /> 4.9
                  </div>

                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 md:p-4">
                    <p className="text-white font-bold text-sm md:text-2xl whitespace-nowrap">
                      K {room.price_per_night.toLocaleString()}
                      <span className="text-[10px] md:text-sm font-normal text-gray-300"> / night</span>
                    </p>
                  </div>
                </div>
                
                {/* Reduced padding for mobile */}
                <div className="p-3 md:p-6 flex-1 flex flex-col">
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight truncate">{room.name}</h3>
                  <p className="text-gray-500 text-[10px] md:text-sm mb-2 md:mb-4 flex items-center gap-1"><MapPin size={10} className="md:w-3.5 md:h-3.5"/> Capital Suit Lodge</p>
                  
                  <p className="text-gray-600 text-[11px] md:text-sm mb-3 md:mb-6 flex-1 line-clamp-2 md:line-clamp-none">{room.description}</p>
                  
                  {/* Hide cancellation on mobile to save space */}
                  <div className="hidden md:flex gap-2 text-xs text-green-700 mb-6 bg-green-50 p-2 rounded-lg w-fit">
                    <CheckCircle2 size={14} /> Free cancellation
                  </div>

                  <Link href={`/book/${room.id}`} className="w-full bg-gray-900 text-white text-center py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-base font-bold hover:bg-yellow-500 hover:text-black transition-colors mt-auto">
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}