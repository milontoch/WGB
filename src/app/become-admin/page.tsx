"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/container";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export default function BecomeAdminPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBecomeAdmin = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/become-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to become admin");
      }

      toast.success("You are now an admin!");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-20">
        <Container>
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D4B58E]">
              <div className="text-4xl mb-4">✅</div>
              <h1 className="font-serif text-2xl text-[#111111] mb-4">
                You are already an admin!
              </h1>
              <button
                onClick={() => router.push("/admin")}
                className="w-full bg-[#111111] text-[#FAF7F2] px-6 py-3 rounded-lg hover:bg-[#D4B58E] hover:text-[#111111] transition-colors font-medium"
              >
                Go to Admin Panel
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D4B58E]">
            <div className="text-4xl mb-4">🔑</div>
            <h1 className="font-serif text-2xl text-[#111111] mb-4">
              Become Admin
            </h1>
            <p className="text-gray-600 mb-6">
              Grant yourself admin privileges to access the admin panel.
            </p>
            <button
              onClick={handleBecomeAdmin}
              disabled={loading}
              className="w-full bg-[#111111] text-[#FAF7F2] px-6 py-3 rounded-lg hover:bg-[#D4B58E] hover:text-[#111111] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Become Admin"}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}