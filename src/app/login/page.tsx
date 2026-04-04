"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2a6c] via-[#2d3a8c] to-[#1a2a6c]">
      <div className="w-full max-w-sm mx-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
        >
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a2a6c] mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1a2a6c]">ROHU</h1>
            <p className="text-sm text-[#00b894] font-semibold">Learn English</p>
            <p className="text-xs text-zinc-400 mt-2">Practice English with AI</p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#1a2a6c] focus:ring-1 focus:ring-[#1a2a6c] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#1a2a6c] focus:ring-1 focus:ring-[#1a2a6c] transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1a2a6c] text-white font-bold text-sm hover:bg-[#2d3a8c] disabled:opacity-50 transition-colors"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
