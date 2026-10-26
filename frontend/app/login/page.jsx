"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    try {
      const r = await api.post("/auth/login", { username: email, password }, true);
      localStorage.setItem("token", r.access_token);
      router.push("/");
    } catch (e) { setErr(e.message); }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" type="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded w-full">Sign in</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </main>
  );
}