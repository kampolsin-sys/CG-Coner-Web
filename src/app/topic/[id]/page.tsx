import { prisma } from "@/lib/db";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TopicPage({ params }: { params: { id: string } }) {
  const topicId = Number(params.id);
  if (isNaN(topicId)) notFound();

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      contents: {
        where: { isHidden: false },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!topic) notFound();

  return (
    <div 
      className="min-h-screen bg-cover bg-bottom bg-fixed flex flex-col font-sans relative"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 py-6">
        <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับไปหน้าหลัก
        </Link>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {topic.imageUrl && (
          <div className="w-full h-48 md:h-64 relative overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={topic.imageUrl} 
              alt={topic.title} 
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{topic.title}</h1>
          {topic.description && (
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{topic.description}</p>
          )}

          <div className="space-y-4 mt-6">
            {topic.contents.length > 0 ? (
              topic.contents.map((content) => (
                <div key={content.id} className="p-5 bg-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-gray-800 text-lg leading-relaxed mb-4">{content.text}</p>
                  {content.linkUrl && (
                    <a
                      href={content.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-base font-semibold text-white bg-secondary hover:bg-primary transition-colors py-2 px-6 rounded-full shadow-sm"
                    >
                      {content.linkUrl.toLowerCase().endsWith('.pdf') ? "เปิดเอกสาร PDF" : (content.linkUrl.includes('/uploads/') ? "ดูไฟล์แนบ" : "คลิก")}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-center py-8">ยังไม่มีเนื้อหาในหัวข้อนี้</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
