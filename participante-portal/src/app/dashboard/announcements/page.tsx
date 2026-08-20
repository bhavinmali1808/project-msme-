"use client";

import { useState, useEffect } from "react";
import { Megaphone, Pin, Loader2, Bell } from "lucide-react";
import api from "@/lib/api";

interface Announcement {
  _id: string;
  title: string;
  body: string;
  type: "Important" | "General" | "Update" | "Deadline";
  audience: string;
  isPublished: boolean;
  pinned: boolean;
  authorName?: string;
  createdAt: string;
}

const TYPE_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  Important: { badge: "bg-red-50 text-red-600 border border-red-100", dot: "bg-red-500", label: "Important" },
  General:   { badge: "bg-blue-50 text-blue-600 border border-blue-100", dot: "bg-blue-500", label: "General" },
  Update:    { badge: "bg-emerald-50 text-emerald-600 border border-emerald-100", dot: "bg-emerald-500", label: "Update" },
  Deadline:  { badge: "bg-amber-50 text-amber-600 border border-amber-100", dot: "bg-amber-500", label: "Deadline" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/announcements")
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch(() => setError("Could not load announcements. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Announcements</h1>
          <p className="text-gray-400 text-sm mt-1">Stay updated with the latest hackathon news</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
          <Bell size={15} /> {announcements.length} announcements
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-400" size={32} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-5 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && announcements.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
          <Megaphone size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">No announcements yet</h2>
          <p className="text-gray-400 text-sm">Check back here for updates from the organizers.</p>
        </div>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((a) => {
            const style = TYPE_STYLES[a.type] || TYPE_STYLES.General;
            return (
              <div
                key={a._id}
                className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-5 ${a.pinned ? "ring-2 ring-indigo-100" : ""}`}
              >
                <div className={`w-1 rounded-full flex-shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {a.pinned && (
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Pin size={11} /> Pinned
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                      {a.type}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{timeAgo(a.createdAt)}</span>
                  </div>
                  <h3 className="font-heading font-bold text-slate-800 text-lg mb-2 leading-tight">{a.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{a.body}</p>
                  {a.authorName && (
                    <p className="text-xs text-gray-300 mt-3">Posted by {a.authorName}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
