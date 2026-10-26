"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Register() {
  const [f, setF] = useState({ email: "", password: "", full_name: "" });
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register", f);
      router.push("/login");
    } catch (e) { setErr(e.message); }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Full name"
          value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Email" type="email"
          value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Password" type="password"
          value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="bg-black text-white px-4 py-2 rounded w-full">Create account</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </main>
  );
}