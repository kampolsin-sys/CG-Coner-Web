"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash, ExternalLink, Pencil, Save, Upload, Image as ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff, LogOut } from "lucide-react";

type Content = {
  id: number;
  text: string;
  linkUrl: string | null;
  order: number;
  isHidden: boolean;
};

type Topic = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isHidden: boolean;
  contents: Content[];
};

export default function AdminPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Form states
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicImage, setNewTopicImage] = useState("");
  const [isUploadingNew, setIsUploadingNew] = useState(false);

  const [activeTopic, setActiveTopic] = useState<number | null>(null);
  const [newContentText, setNewContentText] = useState("");
  const [newContentLink, setNewContentLink] = useState("");

  // Edit states
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editTopicTitle, setEditTopicTitle] = useState("");
  const [editTopicDesc, setEditTopicDesc] = useState("");
  const [editTopicImage, setEditTopicImage] = useState("");
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [editContentText, setEditContentText] = useState("");
  const [editContentLink, setEditContentLink] = useState("");
  const [isUploadingEditContentFile, setIsUploadingEditContentFile] = useState(false);
  const [isUploadingNewContentFile, setIsUploadingNewContentFile] = useState(false);

  const router = useRouter();

  const loadTopics = () => {
    fetch("/api/topics")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setTopics(data);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // --- File/Image Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrlState: (url: string) => void, setLoadingState: (val: boolean) => void, crop = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingState(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/upload?crop=${crop}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUrlState(data.url);
      } else {
        alert("อัปโหลดไฟล์ล้มเหลว");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    } finally {
      setLoadingState(false);
    }
  };

  // --- Add Handlers ---
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle) return;
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: newTopicTitle, 
        description: newTopicDesc,
        imageUrl: newTopicImage || null
      }),
    });
    setNewTopicTitle("");
    setNewTopicDesc("");
    setNewTopicImage("");
    loadTopics();
  };

  const handleAddContent = async (e: React.FormEvent, topicId: number) => {
    e.preventDefault();
    if (!newContentText) return;
    await fetch("/api/contents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId,
        text: newContentText,
        linkUrl: newContentLink || null,
      }),
    });
    setNewContentText("");
    setNewContentLink("");
    setActiveTopic(null);
    loadTopics();
  };

  // --- Delete Handlers ---
  const handleDeleteContent = async (contentId: number) => {
    if (!confirm("ยืนยันการลบเนื้อหานี้?")) return;
    await fetch(`/api/contents/${contentId}`, { method: "DELETE" });
    loadTopics();
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("ยืนยันการลบหัวข้อนี้ (เนื้อหาทั้งหมดในหัวข้อจะถูกลบด้วย)?")) return;
    await fetch(`/api/topics/${topicId}`, { method: "DELETE" });
    loadTopics();
  };

  // --- Edit Topic Handlers ---
  const startEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditTopicTitle(topic.title);
    setEditTopicDesc(topic.description || "");
    setEditTopicImage(topic.imageUrl || "");
  };

  const saveEditTopic = async () => {
    if (!editTopicTitle) return;
    await fetch(`/api/topics/${editingTopicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTopicTitle,
        description: editTopicDesc || null,
        imageUrl: editTopicImage || null
      }),
    });
    setEditingTopicId(null);
    loadTopics();
  };

  // --- Edit Content Handlers ---
  const startEditContent = (content: Content) => {
    setEditingContentId(content.id);
    setEditContentText(content.text);
    setEditContentLink(content.linkUrl || "");
  };

  const saveEditContent = async () => {
    if (!editContentText) return;
    await fetch(`/api/contents/${editingContentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: editContentText,
        linkUrl: editContentLink || null
      }),
    });
    setEditingContentId(null);
    loadTopics();
  };

  // --- Toggle Visibility Handlers ---
  const toggleTopicVisibility = async (topic: Topic) => {
    await fetch(`/api/topics/${topic.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: !topic.isHidden })
    });
    loadTopics();
  };

  const toggleContentVisibility = async (content: Content) => {
    await fetch(`/api/contents/${content.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: !content.isHidden })
    });
    loadTopics();
  };

  // --- Reorder Handlers ---
  const moveTopic = async (index: number, direction: 'up' | 'down') => {
    const newTopics = [...topics];
    if (direction === 'up' && index > 0) {
      [newTopics[index], newTopics[index - 1]] = [newTopics[index - 1], newTopics[index]];
    } else if (direction === 'down' && index < newTopics.length - 1) {
      [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
    } else {
      return;
    }
    setTopics(newTopics); // Optimistic UI update
    const orderedIds = newTopics.map(t => t.id);
    await fetch("/api/topics/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds })
    });
  };

  const moveContent = async (topicId: number, contentIndex: number, direction: 'up' | 'down') => {
    const topicIndex = topics.findIndex(t => t.id === topicId);
    if (topicIndex === -1) return;
    
    const newTopics = [...topics];
    const contents = [...newTopics[topicIndex].contents];
    
    if (direction === 'up' && contentIndex > 0) {
      [contents[contentIndex], contents[contentIndex - 1]] = [contents[contentIndex - 1], contents[contentIndex]];
    } else if (direction === 'down' && contentIndex < contents.length - 1) {
      [contents[contentIndex], contents[contentIndex + 1]] = [contents[contentIndex + 1], contents[contentIndex]];
    } else {
      return;
    }
    
    newTopics[topicIndex].contents = contents;
    setTopics(newTopics); // Optimistic UI update
    
    const orderedIds = contents.map(c => c.id);
    await fetch("/api/contents/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds })
    });
  };

  if (loading) return <div className="p-8 text-center text-primary font-medium mt-10">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">ระบบจัดการเนื้อหา (Admin)</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-secondary hover:text-primary font-medium underline">
            กลับหน้าหลัก
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Add New Topic Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">เพิ่มหัวข้อใหม่ (Topic)</h2>
        <form onSubmit={handleAddTopic} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="ชื่อหัวข้อ (เช่น การบริหารความเสี่ยง)"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          
          <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-primary/20 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" /> รูปภาพหน้าปก (Thumbnail)
              </label>
              <span className="text-xs text-gray-500">
                (ขนาดแนะนำ: 800 x 533 px หรืออัตราส่วน 3:2 ระบบจะทำการ Crop และปรับขนาดให้พอดีอัตโนมัติ)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="วางลิงก์รูปภาพ (URL)..."
                value={newTopicImage}
                onChange={(e) => setNewTopicImage(e.target.value)}
                className="flex-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-primary"
              />
              <span className="text-gray-400 text-sm font-medium px-2">หรือ</span>
              <label className="shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded border border-gray-300 cursor-pointer transition-colors text-sm font-medium">
                {isUploadingNew ? "กำลังอัปโหลด..." : <><Upload className="w-4 h-4 mr-1" /> อัปโหลดจากเครื่อง</>}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, setNewTopicImage, setIsUploadingNew, true)}
                  disabled={isUploadingNew}
                />
              </label>
            </div>
            {newTopicImage && (
              <div className="mt-2 h-32 w-48 relative rounded overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newTopicImage} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          <textarea
            placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
            value={newTopicDesc}
            onChange={(e) => setNewTopicDesc(e.target.value)}
            className="border border-gray-300 rounded-md p-3 h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="bg-primary text-white py-2.5 px-5 rounded-md font-semibold hover:bg-opacity-90 w-fit transition-colors shadow-sm"
          >
            + เพิ่มหัวข้อ
          </button>
        </form>
      </div>

      {/* Topics List */}
      <div className="space-y-6">
        {topics.map((topic, topicIndex) => (
          <div key={topic.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
            
            {/* Topic Reorder Controls */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white border border-gray-200 rounded-md shadow-sm p-1 z-10 hidden md:flex">
              <button 
                onClick={() => moveTopic(topicIndex, 'up')} 
                disabled={topicIndex === 0}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                title="เลื่อนขึ้น"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveTopic(topicIndex, 'down')} 
                disabled={topicIndex === topics.length - 1}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                title="เลื่อนลง"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Topic Header Area */}
            {editingTopicId === topic.id ? (
              <div className="flex flex-col gap-3 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <input
                  type="text"
                  value={editTopicTitle}
                  onChange={(e) => setEditTopicTitle(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:border-blue-500"
                  placeholder="ชื่อหัวข้อ"
                />
                
                <div className="bg-white border border-gray-300 rounded-md p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">รูปภาพหน้าปก</label>
                    <span className="text-xs text-gray-500">
                      (ขนาดแนะนำ: 800 x 533 px หรือ 3:2 ระบบจะ Crop อัตโนมัติ)
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input
                      type="text"
                      value={editTopicImage}
                      onChange={(e) => setEditTopicImage(e.target.value)}
                      className="flex-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="วางลิงก์รูปภาพ (URL)..."
                    />
                    <span className="text-gray-400 text-sm font-medium px-2">หรือ</span>
                    <label className="shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded border border-gray-300 cursor-pointer transition-colors text-sm font-medium">
                      {isUploadingEdit ? "กำลังอัปโหลด..." : <><Upload className="w-4 h-4 mr-1" /> อัปโหลดจากเครื่อง</>}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, setEditTopicImage, setIsUploadingEdit, true)}
                        disabled={isUploadingEdit}
                      />
                    </label>
                  </div>
                  {editTopicImage && (
                    <div className="mt-2 h-24 w-36 relative rounded overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editTopicImage} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>

                <textarea
                  value={editTopicDesc}
                  onChange={(e) => setEditTopicDesc(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full h-20 focus:outline-none focus:border-blue-500"
                  placeholder="รายละเอียด"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingTopicId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium">ยกเลิก</button>
                  <button onClick={saveEditTopic} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 font-medium"><Save className="w-4 h-4"/> บันทึกการแก้ไข</button>
                </div>
              </div>
            ) : (
              <div className={`flex justify-between items-start mb-4 ${topic.isHidden ? 'opacity-60' : ''}`}>
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    {/* Mobile reorder buttons */}
                    <div className="flex md:hidden flex-col gap-0 mr-2 bg-slate-50 border rounded p-1">
                      <button onClick={() => moveTopic(topicIndex, 'up')} disabled={topicIndex === 0} className="text-gray-500 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                      <button onClick={() => moveTopic(topicIndex, 'down')} disabled={topicIndex === topics.length - 1} className="text-gray-500 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {topic.title}
                      {topic.isHidden && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-200">ถูกซ่อน</span>}
                    </h3>
                  </div>
                  {topic.description && <p className="text-gray-500 mt-2">{topic.description}</p>}
                  {topic.imageUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-12 w-20 rounded border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={topic.imageUrl} alt="thumb" className="object-cover w-full h-full opacity-80" />
                      </div>
                      <a href={topic.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                        ดูรูปภาพเต็ม
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap justify-end shrink-0">
                  <button
                    onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
                    className="text-sm bg-secondary text-white py-1.5 px-3 rounded-md hover:bg-opacity-90 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" /> เพิ่มเนื้อหา
                  </button>
                  <button
                    onClick={() => toggleTopicVisibility(topic)}
                    className={`text-sm py-1.5 px-3 rounded-md flex items-center gap-1 font-medium transition-colors border ${topic.isHidden ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                    title={topic.isHidden ? "แสดงหัวข้อนี้" : "ซ่อนหัวข้อนี้"}
                  >
                    {topic.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEditTopic(topic)}
                    className="text-sm bg-blue-50 text-blue-600 py-1.5 px-3 rounded-md hover:bg-blue-100 flex items-center gap-1 font-medium transition-colors border border-blue-100"
                    title="แก้ไขหัวข้อ"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="text-sm bg-red-50 text-red-600 py-1.5 px-3 rounded-md hover:bg-red-100 flex items-center gap-1 font-medium transition-colors border border-red-100"
                    title="ลบหัวข้อ"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Add Content Form */}
            {activeTopic === topic.id && (
              <form onSubmit={(e) => handleAddContent(e, topic.id)} className="bg-slate-50 p-5 rounded-lg mb-4 border border-gray-200 flex flex-col gap-3">
                <textarea
                  placeholder="ข้อความเนื้อหา..."
                  value={newContentText}
                  onChange={(e) => setNewContentText(e.target.value)}
                  className="border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="ลิงก์ URL หรืออัปโหลดไฟล์ (ไม่บังคับ)..."
                    value={newContentLink}
                    onChange={(e) => setNewContentLink(e.target.value)}
                    className="flex-1 w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <label className="shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-md border border-gray-300 cursor-pointer transition-colors text-sm font-medium">
                    {isUploadingNewContentFile ? "กำลังอัปโหลด..." : <><Upload className="w-4 h-4 mr-1" /> แนบไฟล์ / PDF</>}
                    <input 
                      type="file" 
                      accept="*/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, setNewContentLink, setIsUploadingNewContentFile, false)}
                      disabled={isUploadingNewContentFile}
                    />
                  </label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTopic(null)}
                    className="text-gray-500 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors"
                  >
                    บันทึกเนื้อหา
                  </button>
                </div>
              </form>
            )}

            {/* Contents List */}
            {topic.contents.length > 0 ? (
              <ul className="space-y-3 mt-5 border-t pt-5 border-gray-100">
                {topic.contents.map((content, contentIndex) => (
                  <li key={content.id} className="p-4 bg-slate-50 rounded-lg border border-gray-100 flex justify-between gap-4 group hover:bg-slate-100 transition-colors">
                    
                    {/* Content Reorder Controls */}
                    <div className="flex flex-col justify-center gap-1 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => moveContent(topic.id, contentIndex, 'up')} 
                        disabled={contentIndex === 0}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-0"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveContent(topic.id, contentIndex, 'down')} 
                        disabled={contentIndex === topic.contents.length - 1}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-0"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {editingContentId === content.id ? (
                      <div className="flex-1 min-w-0 flex flex-col gap-3">
                        <textarea
                          value={editContentText}
                          onChange={(e) => setEditContentText(e.target.value)}
                          className="border border-gray-300 rounded-md p-2 w-full h-24 focus:outline-none focus:border-blue-500"
                          placeholder="ข้อความเนื้อหา..."
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={editContentLink}
                            onChange={(e) => setEditContentLink(e.target.value)}
                            className="flex-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                            placeholder="ลิงก์ URL หรืออัปโหลดไฟล์ (ไม่บังคับ)..."
                          />
                          <label className="shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md border border-gray-300 cursor-pointer transition-colors text-sm font-medium">
                            {isUploadingEditContentFile ? "กำลังอัปโหลด..." : <><Upload className="w-4 h-4 mr-1" /> แนบไฟล์ / PDF</>}
                            <input 
                              type="file" 
                              accept="*/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, setEditContentLink, setIsUploadingEditContentFile, false)}
                              disabled={isUploadingEditContentFile}
                            />
                          </label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingContentId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 font-medium">ยกเลิก</button>
                          <button onClick={saveEditContent} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-1 font-medium"><Save className="w-4 h-4"/> บันทึก</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`flex-1 min-w-0 ${content.isHidden ? 'opacity-60' : ''}`}>
                          <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                            {content.isHidden && <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 mr-2 align-middle shrink-0">ถูกซ่อน</span>}
                            {content.text}
                          </p>
                          {content.linkUrl && (
                            <a
                              href={content.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-secondary hover:text-primary transition-colors flex items-start mt-3 group/link"
                            >
                              <ExternalLink className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
                              <span className="break-all min-w-0">{content.linkUrl}</span>
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col justify-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleContentVisibility(content)}
                            className={`p-2 bg-white rounded border transition-colors shadow-sm ${content.isHidden ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                            title={content.isHidden ? "แสดงเนื้อหานี้" : "ซ่อนเนื้อหานี้"}
                          >
                            {content.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEditContent(content)}
                            className="text-gray-500 hover:text-blue-600 p-2 bg-white rounded border border-gray-200 transition-colors shadow-sm"
                            title="แก้ไขเนื้อหา"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content.id)}
                            className="text-gray-500 hover:text-red-600 p-2 bg-white rounded border border-gray-200 transition-colors shadow-sm"
                            title="ลบเนื้อหานี้"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 mt-5 italic">ยังไม่มีเนื้อหาในหัวข้อนี้</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
