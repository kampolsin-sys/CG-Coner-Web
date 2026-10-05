"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

type Topic = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isHidden: boolean;
};

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-primary font-medium text-lg">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-bottom bg-fixed flex flex-col font-sans relative"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Page Overlay to soften the background */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0 pointer-events-none"></div>
      
      {/* Hero Section */}
      <header className="relative py-6 md:py-8 px-4 z-10">
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="flex justify-center relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="CG Corner Logo" className="h-24 md:h-32 object-contain drop-shadow-md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.filter(topic => !topic.isHidden).map((topic) => (
            <Link href={`/topic/${topic.id}`} key={topic.id} className="group h-full">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Thumbnail */}
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {topic.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={topic.imageUrl} 
                      alt={topic.title} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-400 group-hover:scale-105 transition-transform duration-500">
                      <span className="font-semibold text-lg drop-shadow-sm">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {topic.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {topic.description || "คลิกเพื่ออ่านเนื้อหาและรายละเอียดเพิ่มเติม..."}
                  </p>
                  
                  <div className="flex items-center text-secondary font-semibold text-sm group-hover:text-primary transition-colors mt-auto">
                    อ่านเพิ่มเติม
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/60 backdrop-blur-md border-t border-white/20 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p className="mb-4 md:mb-0 font-medium">© {new Date().getFullYear()} CG Corner Knowledge Sharing.</p>
          <Link href="/admin" className="text-primary hover:text-[#3a7ca5] font-semibold hover:underline flex items-center transition-colors">
            ระบบจัดการเนื้อหา (Admin Dashboard)
          </Link>
        </div>
      </footer>
    </div>
  );
}
