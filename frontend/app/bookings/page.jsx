"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function MyBookings() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try { setRows(await api.get("/bookings/me")); }
    catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm("Cancel this booking?")) return;
    await api.del(`/bookings/${id}`);
    load();
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl mb-4">My bookings</h1>
      {err && <p className="text-red-600">{err}</p>}
      <ul className="space-y-3">
        {rows.map((b) => (
          <li key={b.id} className="border rounded p-4 flex justify-between">
            <div>
              <div className="font-semibold">
                {new Date(b.start_dt).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Service #{b.service_id} &middot; status: {b.status}
              </div>
            </div>
            {b.status === "confirmed" && (
              <button onClick={() => cancel(b.id)} className="text-red-600 underline">
                Cancel
              </button>
            )}
          </li>
        ))}
        {rows.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
      </ul>
    </main>
  );
}