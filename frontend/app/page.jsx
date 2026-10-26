"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, Star, Wifi, Utensils, Waves, Car, ChevronRight, Phone, Mail, 
  ShieldCheck, Map, X, CheckCircle2, Tv, Coffee, Lock, Languages, Bell,
  Clock, Ban, Users, ShieldAlert, CalendarX, Maximize2
} from "lucide-react";

// HERO SLIDER (Your 3 permanent Postimage links)
const heroImages = [
  "https://i.postimg.cc/522q55YC/first.webp",
  "https://i.postimg.cc/DyB1zWjL/second.webp",
  "https://i.postimg.cc/mkV1hqSn/4.webp"
];

// EXPLORE GALLERY (Your 2 explore-only images + 3 hero images + 10 Booking images = 15 total)
const exploreImages = [
  "https://i.postimg.cc/2S1L80LK/explor.webp",
  "https://i.postimg.cc/gJWxsdtY/5.jpg",
  "https://i.postimg.cc/522q55YC/first.webp",
  "https://i.postimg.cc/DyB1zWjL/second.webp",
  "https://i.postimg.cc/mkV1hqSn/4.webp",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182154.jpg?k=6a23a92377772228572266379c270b1b82bf7081856efecd7cac0f14c5eab58a&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182141.jpg?k=0e0d1b8852d18b722e9e1c791805b11072177258b6264eb0087a79539adc701f&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929181552.jpg?k=03881d2de441ddf4fbd6bdefa9b14c5f0b5725dcf215e6553bda90291ea73f33&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929179883.jpg?k=ab21ae2a921eb4456e8593cdb2aebf1b27e8adf5907edb9fdaa4f4404f91d7bf&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929181546.jpg?k=acaa915d7f0de78e1a54d22efe3a0ca430ffdd090a7b43e2120f8096fed69cdd&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929181595.jpg?k=8ea77c85f4c34f11c475d1231f5ce1ef54499f3eec3ee1497d562878d15f4dd4&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182045.jpg?k=255a4b362322408b4de123986581c113c4fe3007982e0f1714a078fe09f22485&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182060.jpg?k=35076c8b4bca53cf772b010d7b135442c2baf37eb91e016b8886840c4c268d5b&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929181668.jpg?k=ac4eaf587edf97281368c12d1b3329e7ac52dcf49773b0d89c764807026f51d2&o=",
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/929182163.jpg?k=837fe49eb5a339e659aae7b9da067c8998bfea895bf0ecf6c5e1b48df1b06e0a&o="
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [activeImage, setActiveImage] = useState(exploreImages[0]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white overflow-x-hidden">
      
      <nav className="absolute top-0 w-full z-50 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-2xl font-serif font-bold text-yellow-500">Capital Suit</div>
        <div className="space-x-4 text-sm font-medium">
          <Link href="/rooms" className="hover:text-yellow-500 transition">Rooms</Link>
          <Link href="/admin" className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-yellow-500 hover:text-black transition">Admin</Link>
        </div>
      </nav>

      {/* Hero Slider - 100% Black Flash Free */}
      <div className="relative h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
        {heroImages.map((img, i) => (
          <img
            key={i}
            src={img}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            loading="eager"
            alt={`Slide ${i + 1}`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 text-center px-4 max-w-3xl mt-20">
          <p className="text-yellow-500 font-semibold tracking-widest uppercase text-sm mb-4">A truly outstanding 4-star property</p>
          <h1 className="text-4xl md:text-7xl font-serif mb-6 leading-tight drop-shadow-lg">Experience Luxury at <br/><span className="text-yellow-500">Capital Suit Lodge</span></h1>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/rooms" className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition flex items-center gap-2 shadow-xl shadow-yellow-500/20">Explore Rooms <ChevronRight size={20} /></Link>
          </div>
        </div>
      </div>

      <div className="bg-white text-gray-900 py-16 md:py-20 px-4 md:px-6 rounded-t-[2rem] md:rounded-t-[3rem] -mt-10 relative z-30">
        <div className="max-w-6xl mx-auto">
          
          {/* Amenities */}
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-2">Amenities</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 md:mb-12">World-Class Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { icon: <Wifi size={24}/>, name: "High-Speed WiFi" },
                { icon: <Waves size={24}/>, name: "Infinity Pool" },
                { icon: <Utensils size={24}/>, name: "Fine Dining" },
                { icon: <Car size={24}/>, name: "Free Parking" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 md:gap-4 group">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition duration-300">{item.icon}</div>
                  <span className="font-semibold text-gray-700 text-sm md:text-base">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Thumbnail Gallery */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-center">Explore The Lodge</h2>
            
            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[450px]">
              
              {/* Big Window - INSTANT LOAD, NO FADE */}
              <div className="w-full md:w-2/3 h-64 md:h-full rounded-2xl overflow-hidden shadow-lg relative bg-gray-200">
                <img 
                  src={activeImage}
                  className="w-full h-full object-cover"
                  alt="Lodge Main View"
                />
                <div className="absolute bottom-4 left-4 text-white z-10 drop-shadow-md">
                  <p className="font-serif text-lg md:text-2xl font-bold mb-1">Capital Suit Experience</p>
                  <p className="text-xs md:text-sm opacity-90 flex items-center gap-1"><Maximize2 size={12}/> Select thumbnail to expand</p>
                </div>
              </div>

              {/* Scrollable Thumbnails */}
              <div className="w-full md:w-1/3 flex md:flex-col flex-row gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {exploreImages.map((img, i) => (
                  <div 
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-24 h-20 md:w-full md:h-28 rounded-xl overflow-hidden cursor-pointer snap-start transition-all duration-300 bg-gray-200 ${activeImage === img ? 'ring-4 ring-yellow-500 scale-[0.98]' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
                  </div>
                ))}
              </div>

            </div>
          </div>

          <hr className="border-gray-100 my-12" />

          {/* Location Section */}
          <div className="bg-gray-50 p-6 md:p-12 rounded-3xl border border-gray-100 shadow-sm mb-20 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 flex items-center gap-2"><MapPin className="text-yellow-600"/> Our Location</h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
                Conveniently located right opposite the iconic <strong>Bingu National Stadium</strong> in Lilongwe. Perfect for sports fans, business travelers, and tourists looking for premium comfort.
              </p>
              
              <div className="space-y-3 text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 mb-6">
                <div className="flex items-center gap-3"><Phone className="text-yellow-600" size={18}/> <span className="font-semibold">Direct: +265 882 18 34 88</span></div>
                <div className="flex items-center gap-3"><Mail className="text-yellow-600" size={18}/> <span className="font-semibold">bookings@capitalsuit.com</span></div>
                <div className="flex items-center gap-3"><ShieldCheck className="text-yellow-600" size={18}/> <span className="font-semibold">24/7 Premium Concierge & Security</span></div>
              </div>

              {!showMap ? (
                <button onClick={() => setShowMap(true)} className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                  <Map size={20} /> View on Map
                </button>
              ) : (
                <button onClick={() => setShowMap(false)} className="w-full md:w-auto bg-red-50 text-red-600 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition">
                  <X size={20} /> Close Map
                </button>
              )}
            </div>

            {showMap && (
              <div className="flex-1 w-full animate-in fade-in zoom-in duration-300">
                <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.476922568839!2d33.76815531483019!3d-13.94645199020765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1921a7236691a723%3A0x6691a7236691a723!2sBingu%20National%20Stadium!5e0!3m2!1sen!2smw!4v1620000000000!5m2!1sen!2smw" width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy"></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Facilities Section */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Facilities of Capital Suites Lodges</h2>
              <p className="text-gray-500 flex items-center justify-center gap-2"><CheckCircle2 className="text-green-500" size={18}/> Great for your stay</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-gray-900 text-base mb-4 border-b pb-2 flex items-center gap-2"><Star className="text-yellow-500" size={18}/> Most Popular</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><Wifi size={18} className="text-gray-400"/> Free WiFi</li>
                  <li className="flex items-center gap-3"><Car size={18} className="text-gray-400"/> Free parking</li>
                  <li className="flex items-center gap-3"><Utensils size={18} className="text-gray-400"/> Restaurant</li>
                  <li className="flex items-center gap-3"><Bell size={18} className="text-gray-400"/> Room service</li>
                  <li className="flex items-center gap-3"><Coffee size={18} className="text-gray-400"/> Bar</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-gray-900 text-base mb-4 border-b pb-2 flex items-center gap-2"><Tv className="text-yellow-500" size={18}/> Room Amenities</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Streaming service (Netflix)</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Flat-screen TV</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Wardrobe & Clothes rack</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Electric kettle</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Desk & Seating Area</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-gray-900 text-base mb-4 border-b pb-2 flex items-center gap-2"><ShieldCheck className="text-yellow-500" size={18}/> Services & Safety</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> 24-hour front desk</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> 24-hour security</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> CCTV in common areas</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Fire extinguishers</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> Non-smoking rooms</li>
                </ul>
              </div>
            </div>
          </div>

          {/* House Rules Section */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">House Rules</h2>
              <p className="text-gray-500 text-sm">Capital Suites Lodges takes special requests - add in the next step!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="bg-yellow-50 p-3 rounded-xl h-fit text-yellow-600"><Clock size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Check-in & Check-out</h3>
                  <p className="text-sm text-gray-700 mb-1"><strong className="text-gray-900">Check-in:</strong> From 16:00 to 19:00</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="text-gray-900">Check-out:</strong> From 10:00 to 11:00</p>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">Guests are required to show a photo identification and credit card upon check-in. You'll need to let the property know in advance what time you'll arrive.</p>
                </div>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="bg-red-50 p-3 rounded-xl h-fit text-red-600"><Ban size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Pets & Parties</h3>
                  <p className="text-sm text-gray-700 mb-1"><strong className="text-gray-900">Pets:</strong> Pets are not allowed.</p>
                  <p className="text-sm text-gray-700 mb-1"><strong className="text-gray-900">Parties:</strong> Parties/events are not allowed.</p>
                </div>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="bg-green-50 p-3 rounded-xl h-fit text-green-600"><ShieldAlert size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Age Restriction</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">There is no age requirement for check-in.</p>
                </div>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="bg-yellow-50 p-3 rounded-xl h-fit text-yellow-600"><CalendarX size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Cancellation</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Cancellation and prepayment policies vary according to accommodation type. Please check what conditions may apply to each option when making your selection.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}