"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, BedDouble, 
  TrendingUp, Users, CalendarDays, LogOut, Check, X 
} from "lucide-react";

export default function Admin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api.get("/bookings");
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    // Optimistic UI update for instant feedback
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/status?status=${status}`, { 
        method: 'PATCH' 
      });
      load(); // Reload to ensure sync
    } catch (e) {
      alert("Failed to update status");
      load(); // Revert on failure
    }
  }

  const pending = bookings.filter(b => b.status === "pending");
  const confirmed = bookings.filter(b => b.status === "confirmed");
  const staying = bookings.filter(b => b.status === "checked_in");
  
  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + b.total_price, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Manage your lodge bookings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 hidden md:block">Capital Suit Lodge</span>
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">C</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">K {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{confirmed.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Staying Now</p>
              <p className="text-2xl font-bold text-gray-900">{staying.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <BedDouble size={24} />
            </div>
          </div>
        </div>

        {/* Pending Bookings Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-yellow-500" size={20}/> Action Required (Pending)
            </h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">{pending.length} New</span>
          </div>
          
          {pending.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40}/>
              <p>All caught up! No pending bookings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left hidden md:table">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">Room & Dates</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {pending.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{b.guest_name}</p>
                        <p className="text-gray-500">{b.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">Room {b.room_id}</p>
                        <p className="text-gray-500 text-xs">{b.check_in} to {b.check_out}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">K {b.total_price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => updateStatus(b.id, "confirmed")} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition">
                          <Check size={14}/> Confirm
                        </button>
                        <button onClick={() => updateStatus(b.id, "cancelled")} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition">
                          <X size={14}/> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mobile View for Pending */}
              <div className="md:hidden divide-y divide-gray-100">
                {pending.map(b => (
                  <div key={b.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{b.guest_name}</p>
                        <p className="text-xs text-gray-500">{b.phone}</p>
                      </div>
                      <span className="font-bold text-gray-900">K {b.total_price.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Room {b.room_id}</p>
                      <p className="text-xs">{b.check_in} to {b.check_out}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => updateStatus(b.id, "confirmed")} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        <Check size={14}/> Confirm
                      </button>
                      <button onClick={() => updateStatus(b.id, "cancelled")} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        <X size={14}/> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Confirmed Bookings Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="text-blue-500" size={20}/> Upcoming Stays
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{confirmed.length} Confirmed</span>
          </div>
          
          {confirmed.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No confirmed bookings yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left hidden md:table">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">Room & Dates</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {confirmed.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{b.guest_name}</p>
                        <p className="text-gray-500">{b.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">Room {b.room_id}</p>
                        <p className="text-gray-500 text-xs">{b.check_in} to {b.check_out}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">K {b.total_price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => updateStatus(b.id, "checked_in")} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition">
                          Check In
                        </button>
                        <button onClick={() => updateStatus(b.id, "cancelled")} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile View for Confirmed */}
              <div className="md:hidden divide-y divide-gray-100">
                {confirmed.map(b => (
                  <div key={b.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{b.guest_name}</p>
                        <p className="text-xs text-gray-500">{b.phone}</p>
                      </div>
                      <span className="font-bold text-gray-900">K {b.total_price.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Room {b.room_id}</p>
                      <p className="text-xs">{b.check_in} to {b.check_out}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => updateStatus(b.id, "checked_in")} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-xs font-bold">
                        Check In
                      </button>
                      <button onClick={() => updateStatus(b.id, "cancelled")} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Currently Staying Section */}
        {staying.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BedDouble className="text-purple-500" size={20}/> Currently Staying
              </h2>
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">{staying.length} In-House</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left hidden md:table">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Check-out</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {staying.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{b.guest_name}</p>
                        <p className="text-gray-500">{b.phone}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">Room {b.room_id}</td>
                      <td className="px-6 py-4 text-gray-600">{b.check_out}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => updateStatus(b.id, "checked_out")} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition">
                          <LogOut size={14}/> Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile View for Staying */}
              <div className="md:hidden divide-y divide-gray-100">
                {staying.map(b => (
                  <div key={b.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{b.guest_name}</p>
                      <p className="text-xs text-gray-500">Room {b.room_id} • Out: {b.check_out}</p>
                    </div>
                    <button onClick={() => updateStatus(b.id, "checked_out")} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                      <LogOut size={14}/> Check Out
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}