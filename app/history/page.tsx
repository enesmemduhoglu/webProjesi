"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Chat {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchChats();
    }
  }, [status, router]);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-800">
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Geçmiş Konuşmalar
          </h1>
        </div>

        <div className="grid gap-6">
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Henüz hiç konuşma geçmişiniz yok.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-white/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(chat.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(chat.createdAt).toLocaleTimeString("tr-TR")}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Soru:</h3>
                    <p className="text-gray-700">{chat.prompt}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="font-semibold text-purple-800 mb-2">Cevap:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {chat.response}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 