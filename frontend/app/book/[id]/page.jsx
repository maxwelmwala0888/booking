"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle2, ArrowLeft, ShieldCheck, CreditCard, Smartphone, AlertCircle, Copy, Check, Building2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookRoom() {
  const { id } = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [room, setRoom] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedText, setCopiedText] = useState("");
  
  const [checking, setChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(tomorrow.getTime() + 86400000).toISOString().split('T')[0]);
  
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));

  const [form, setForm] = useState({
    guest_name: "", email: "", phone: "", origin: "", payment_method: "Airtel Money"
  });

  useEffect(() => {
    api.get("/rooms").then(res => {
      const r = res.find(x => x.id === Number(id));
      setRoom(r);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !checkIn || !checkOut) return;
    setChecking(true);
    setErrorMsg("");
    
    api.get(`/bookings/check-availability?room_id=${id}&check_in=${checkIn}&check_out=${checkOut}`)
      .then(res => {
        setIsAvailable(res.available);
        if (!res.available) {
          setErrorMsg("This room is already booked for these dates. Please choose different dates.");
        }
      })
      .catch(() => setErrorMsg("Failed to check availability. Please try again."))
      .finally(() => setChecking(false));
  }, [id, checkIn, checkOut]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  async function handleSubmit() {
    if (!isAvailable) return;
    setErrorMsg("");
    if (!form.guest_name || !form.email || !form.phone) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    try {
      await api.post("/bookings", {
        ...form, room_id: Number(id), check_in: checkIn, check_out: checkOut,
      });
      setStep(3);
    } catch (e) { 
      setErrorMsg(e.message);
      setIsAvailable(false);
    }
  }

  if (!room) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  const paymentMethods = [
    { name: "Airtel Money", icon: <Smartphone size={22}/>, color: "text-red-600 bg-red-50", details: [ { label: "Merchant Code", value: "88291", copyable: true }, { label: "Account Name", value: "Capital Suit Lodge" } ] },
    { name: "Mpamba", icon: <Smartphone size={22}/>, color: "text-blue-600 bg-blue-50", details: [ { label: "Phone Number", value: "+265 888 123 456", copyable: true }, { label: "Account Name", value: "Capital Suit Lodge" } ] },
    { name: "Bank Transfer", icon: <Building2 size={22}/>, color: "text-green-700 bg-green-50", details: [ { label: "Bank Name", value: "National Bank of Malawi" }, { label: "Account Number", value: "1002 3456 7890", copyable: true }, { label: "Account Name", value: "Capital Suit Lodge" }, { label: "Branch", value: "Capital City" } ] }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 relative">
        <img src={room.image_url} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 p-12 flex flex-col justify-between">
          <button onClick={() => router.push('/rooms')} className="text-white flex items-center gap-2 w-fit bg-white/20 px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/30 transition"><ArrowLeft size={18} /> Back to Rooms</button>
          <div>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">{room.name}</h1>
            {/* CHANGED TO KWACHA */}
            <p className="text-yellow-500 font-bold text-2xl">K {room.price_per_night.toLocaleString()} <span className="text-white text-base font-normal">/ night</span></p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-6 md:p-12 relative overflow-y-auto h-screen">
        <button onClick={() => router.push('/rooms')} className="md:hidden absolute top-6 left-6 text-gray-500 flex items-center gap-1 text-sm"><ArrowLeft size={16}/> Back</button>

        <div className="max-w-md w-full mx-auto mt-10 md:mt-0">
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Select Dates to Check Availability</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-gray-500">Check-In</label><input type="date" className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-yellow-500 outline-none" value={checkIn} onChange={e=>setCheckIn(e.target.value)}/></div>
              <div><label className="text-xs font-semibold text-gray-500">Check-Out</label><input type="date" className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-yellow-500 outline-none" value={checkOut} onChange={e=>setCheckOut(e.target.value)}/></div>
            </div>
          </div>

          {checking ? (
            <div className="text-center p-6 text-gray-500 animate-pulse">Checking availability...</div>
          ) : !isAvailable ? (
             <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center gap-3 text-center border border-red-100">
              <AlertCircle size={32} /> 
              <p className="font-bold text-lg">Room Unavailable</p>
              <p className="text-sm">This room is already booked for these dates. Please change your check-in/check-out dates above to see if it becomes available.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
                {[1, 2, 3].map(num => (
                  <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= num ? 'bg-yellow-500 text-black' : 'bg-gray-200 text-gray-500'}`}>{num}</div>
                ))}
              </div>

              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Guest Details</h2>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Available</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div><label className="text-xs font-semibold text-gray-500 uppercase">Full Name *</label><input className="w-full border-b-2 border-gray-200 p-2 focus:border-yellow-500 outline-none transition" value={form.guest_name} onChange={e=>setForm({...form, guest_name: e.target.value})} placeholder="John Doe"/></div>
                    <div><label className="text-xs font-semibold text-gray-500 uppercase">Email Address *</label><input className="w-full border-b-2 border-gray-200 p-2 focus:border-yellow-500 outline-none transition" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="john@example.com"/></div>
                    <div><label className="text-xs font-semibold text-gray-500 uppercase">Phone Number *</label><input className="w-full border-b-2 border-gray-200 p-2 focus:border-yellow-500 outline-none transition" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="+265..."/></div>
                    <div><label className="text-xs font-semibold text-gray-500 uppercase">Country / Origin</label><input className="w-full border-b-2 border-gray-200 p-2 focus:border-yellow-500 outline-none transition" value={form.origin} onChange={e=>setForm({...form, origin: e.target.value})} placeholder="Zambia, Lusaka"/></div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl mt-8 hover:bg-yellow-500 hover:text-black transition">Continue to Payment</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Payment Method</h2>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100">
                    <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Room:</span> <span className="font-bold text-gray-900">{room.name}</span></div>
                    <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Dates:</span> <span className="font-bold text-gray-900">{checkIn} to {checkOut}</span></div>
                    {/* CHANGED TO KWACHA */}
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-3"><span>Total ({nights} nights):</span> <span className="text-yellow-600">K {(room.price_per_night * nights).toLocaleString()}</span></div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {paymentMethods.map(method => (
                      <div key={method.name} className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${form.payment_method === method.name ? 'border-yellow-500 shadow-md shadow-yellow-500/10' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div onClick={() => setForm({...form, payment_method: method.name})} className="p-4 flex items-center gap-4 cursor-pointer bg-white">
                          <div className={`p-2 rounded-lg ${method.color}`}>{method.icon}</div>
                          <span className="font-bold text-gray-800">{method.name}</span>
                          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.payment_method === method.name ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}>{form.payment_method === method.name && <Check size={12} className="text-black" />}</div>
                        </div>
                        <AnimatePresence>
                          {form.payment_method === method.name && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="bg-gray-50 border-t border-gray-100">
                              <div className="p-5 space-y-4">
                                {method.details.map((detail, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{detail.label}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-gray-900 tracking-wide">{detail.value}</span>
                                      {detail.copyable && (
                                        <button onClick={() => copyToClipboard(detail.value)} className="p-1.5 hover:bg-gray-200 rounded-md transition text-gray-400 hover:text-gray-800">
                                          {copiedText === detail.value ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {errorMsg && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100"><AlertCircle size={20} /> {errorMsg}</div>}

                  <button onClick={handleSubmit} className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/30 flex justify-center items-center gap-2">
                    <Lock size={18} /> Confirm & Pay
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Booking Received!</h2>
              <p className="text-gray-500 mb-8">Your stay is pending owner confirmation. We will contact you shortly.</p>
              
              <div className="bg-gray-50 p-6 rounded-2xl text-left text-sm space-y-3 text-gray-600 mb-8 border border-gray-100">
                <div className="flex justify-between"><span>Guest:</span> <span className="font-bold text-gray-900">{form.guest_name}</span></div>
                <div className="flex justify-between"><span>Room:</span> <span className="font-bold text-gray-900">{room.name}</span></div>
                <div className="flex justify-between"><span>Dates:</span> <span className="font-bold text-gray-900">{checkIn} to {checkOut}</span></div>
                {/* CHANGED TO KWACHA */}
                <div className="flex justify-between border-t pt-3 mt-3"><span>Total:</span> <span className="font-bold text-green-600 text-lg">K {(room.price_per_night * nights).toLocaleString()}</span></div>
              </div>
              
              <button onClick={() => router.push('/')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition">Return to Home</button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}