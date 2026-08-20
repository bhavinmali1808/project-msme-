"use client";

import { motion } from "framer-motion";
import { GraduationCap, UsersRound, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

interface UniversityData {
  _id: string;
  name: string;
  city: string;
  approvalStatus: string;
  totalStudents: number;
  totalTeams: number;
  totalMentors: number;
  createdAt: string;
}

export default function UniversityOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UniversityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.universityId) {
      api.get(`/universities/${user.universityId}`)
        .then(({ data }) => setData(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const stats = data ? [
    {
      label: "Registered Students",
      value: data.totalStudents,
      icon: <GraduationCap size={22} />,
      color: "text-blue-600", bg: "bg-blue-50", href: "/university/students"
    },
    {
      label: "Hackathon Teams",
      value: data.totalTeams,
      icon: <UsersRound size={22} />,
      color: "text-violet-600", bg: "bg-violet-50", href: "/university/teams"
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            {loading ? "Loading..." : data?.name || "University Dashboard"}
          </h1>
          {data && <p className="text-gray-400 mt-1 text-sm">{data.city}</p>}
        </div>
        {data && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${
            data.approvalStatus === "approved"
              ? "bg-green-50 text-green-700 border-green-100"
              : data.approvalStatus === "pending"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}>
            {data.approvalStatus === "approved" ? <CheckCircle size={14} /> : data.approvalStatus === "pending" ? <Clock size={14} /> : <AlertTriangle size={14} />}
            {data.approvalStatus.charAt(0).toUpperCase() + data.approvalStatus.slice(1)}
          </div>
        )}
      </div>

      {/* Pending notice */}
      {data?.approvalStatus === "pending" && (
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
          <Clock className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-amber-800">Awaiting Approval</p>
            <p className="text-xs text-amber-600 mt-1">
              Your university is pending review by the hackathon admin. Students will be able to enroll once approved.
              You can still explore the dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={stat.href}
              className="block bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-5">
        <Link href="/university/teams"
          className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 text-white hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 transition-all group">
          <UsersRound size={28} className="mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-heading font-bold mb-2">Manage Teams</h3>
          <p className="text-violet-100 text-sm">View team details from your university.</p>
        </Link>
      </div>
    </div>
  );
}
