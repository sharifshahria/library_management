"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const user = JSON.parse(stored);
      router.replace(user?.isAdmin ? "/dashboard" : "/welcome");
    } catch {
      // ignore malformed data and stay on landing page
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h1 className="text-3xl font-bold mb-4">Library Books Management System</h1>
        <p className="text-gray-700 mb-6">
          Welcome! Please login or signup to manage your library books.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
            Login
          </a>
          <a href="/signup" className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition">
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}