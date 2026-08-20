"use client";

import { useState, useEffect } from "react";
import { UsersRound, UserCheck, ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Member { _id: string; name: string; email: string; studentId?: string; }
interface Team {
  _id: string;
  teamName: string;
  approvalStatus: string;
  leaderId: { name: string; email: string } | null;
  memberIds: Member[];
}

export default function UniversityTeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.universityId) {
      api.get(`/universities/${user.universityId}/teams`)
        .then((t) => setTeams(t.data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Teams</h1>
        <p className="text-gray-400 text-sm mt-1">View teams formed by your students</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-300 text-sm">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl">
          <UsersRound size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">No teams yet</p>
          <p className="text-gray-300 text-xs mt-1">Teams will appear here once students from your university form them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map(team => (
            <div key={team._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                      <UsersRound className="text-violet-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-800">{team.teamName}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        team.approvalStatus === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}>{team.approvalStatus}</span>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[team.leaderId, ...team.memberIds].filter(Boolean).map((m, i) => (
                      <span key={i} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {(m as Member)?.name || (m as { name: string })?.name}
                        {i === 0 && <span className="ml-1 text-violet-500 font-semibold">(Leader)</span>}
                      </span>
                    ))}
                  </div>
                </div>


              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
