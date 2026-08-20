"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, GraduationCap, UserPlus, Search, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface University {
  _id: string;
  name: string;
  city: string;
}

const getSchema = (isStartup: boolean) => z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  universityId: isStartup ? z.string().optional() : z.string().min(1, "Please select your university"),
  studentId: isStartup ? z.string().optional() : z.string().min(1, "Enrollment/Student ID is required"),
  department: isStartup ? z.string().optional() : z.string().min(2, "Department is required"),
  year: isStartup ? z.string().optional() : z.string().min(1, "Year of study is required"),
  gender: z.string().min(1, "Gender is required"),
  city: z.string().min(2, "City is required"),
  teamRole: z.string().min(2, "Primary role or skill is required"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<ReturnType<typeof getSchema>>;

function FormInput({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

const inputClass = "w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all text-sm";

function StudentRegisterForm() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isStartup = searchParams.get("type") === "startup";

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(getSchema(isStartup))
  });

  const selectedUniId = watch("universityId");

  useEffect(() => {
    api.get("/universities").then(({ data }) => {
      setUniversities(data);
    }).catch(() => { }).finally(() => setLoadingUnis(false));
  }, []);

  const filteredUnis = universities.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.city.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");
    try {
      if (isStartup) {
        const { data: res } = await api.post("/auth/register-participant", {
          name: data.name, email: data.email, phone: data.phone,
          password: data.password, category: "startup", city: data.city, gender: data.gender,
          teamRole: data.teamRole
        });
        Cookies.set("hackathon_token", res.token, { expires: 7, path: '/' });
        Cookies.set("hackathon_user", JSON.stringify(res.user), { expires: 7, path: '/' });
        localStorage.setItem("hackathon_token", res.token);
        localStorage.setItem("hackathon_user", JSON.stringify(res.user));
      } else {
        const { data: res } = await api.post("/auth/register-student", {
          name: data.name, email: data.email, phone: data.phone,
          password: data.password, universityId: data.universityId,
          studentId: data.studentId, department: data.department,
          year: data.year, gender: data.gender, city: data.city,
          teamRole: data.teamRole
        });
        Cookies.set("hackathon_token", res.token, { expires: 7, path: '/' });
        Cookies.set("hackathon_user", JSON.stringify(res.user), { expires: 7, path: '/' });
        localStorage.setItem("hackathon_token", res.token);
        localStorage.setItem("hackathon_user", JSON.stringify(res.user));
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6 relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[130px] pointer-events-none" suppressHydrationWarning />

      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/register" className="inline-flex items-center gap-2 text-gray-400 hover:text-slate-700 transition-colors text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-slate-900">
                {isStartup ? "Startup Registration" : "Student Registration"}
              </h1>
              <p className="text-gray-400 text-sm">
                {isStartup ? "Register your startup for the hackathon" : "Join the hackathon through your university"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {!isStartup && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-heading font-semibold text-slate-800 mb-5">University Details</h2>
                <FormInput label="Select University" error={errors.universityId?.message}>
                  {loadingUnis ? (
                    <div className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-400">Loading universities...</div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or select your university..."
                        value={search}
                        onChange={e => {
                          setSearch(e.target.value);
                          setIsOpen(true);
                          if (selectedUniId) setValue("universityId", "", { shouldValidate: true });
                        }}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        className={inputClass}
                      />
                      <input type="hidden" {...register("universityId")} />
                      
                      {isOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                          {filteredUnis.length > 0 ? filteredUnis.map(uni => (
                            <button
                              key={uni._id}
                              type="button"
                              onClick={() => {
                                setValue("universityId", uni._id, { shouldValidate: true });
                                setSearch(`${uni.name} (${uni.city})`);
                                setIsOpen(false);
                              }}
                              className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <div className="font-semibold text-slate-700 text-sm">{uni.name}</div>
                              <div className="text-xs text-gray-400">{uni.city}</div>
                            </button>
                          )) : (
                            <div className="p-3 text-sm text-gray-400">No universities found</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </FormInput>
                <p className="text-xs text-gray-400 mt-3">Only registered & approved universities are shown in the dropdown. If yours isn't listed, please ask your university administration to register.</p>
              </div>
            )}

            {/* Personal Details */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-heading font-semibold text-slate-800 mb-5">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Full Name" error={errors.name?.message}>
                  <input {...register("name")} type="text" placeholder="John Doe" className={inputClass} />
                </FormInput>
                <FormInput label="Email Address" error={errors.email?.message}>
                  <input {...register("email")} type="email" placeholder="john@university.edu" className={inputClass} />
                </FormInput>
                <FormInput label="Phone Number" error={errors.phone?.message}>
                  <input {...register("phone")} type="tel" placeholder="+91 98765 43210" className={inputClass} />
                </FormInput>
                <FormInput label="Gender" error={errors.gender?.message}>
                  <select {...register("gender")} className={inputClass}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                </FormInput>
                <FormInput label="City" error={errors.city?.message}>
                  <input {...register("city")} type="text" placeholder="Ahmedabad" className={inputClass} />
                </FormInput>
                <FormInput label="Team Role / Skill" error={errors.teamRole?.message}>
                  <input {...register("teamRole")} type="text" placeholder="e.g. Frontend Dev, Designer" className={inputClass} />
                </FormInput>
              </div>
            </div>

            {/* Academic Details */}
            {!isStartup && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-heading font-semibold text-slate-800 mb-5">Academic Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Enrollment / Student ID" error={errors.studentId?.message}>
                    <input {...register("studentId")} type="text" placeholder="e.g. 21CEENL001" className={inputClass} />
                  </FormInput>
                  <FormInput label="Department / Branch" error={errors.department?.message}>
                    <input {...register("department")} type="text" placeholder="e.g. Computer Engineering" className={inputClass} />
                  </FormInput>
                  <FormInput label="Year of Study" error={errors.year?.message}>
                    <select {...register("year")} className={inputClass}>
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                      <option value="5">5th Year (PG/Diploma)</option>
                    </select>
                  </FormInput>
                </div>
              </div>
            )}

            {/* Security */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-heading font-semibold text-slate-800 mb-5">Create Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Password" error={errors.password?.message}>
                  <input {...register("password")} type="password" placeholder="••••••••" className={inputClass} />
                </FormInput>
                <FormInput label="Confirm Password" error={errors.confirmPassword?.message}>
                  <input {...register("confirmPassword")} type="password" placeholder="••••••••" className={inputClass} />
                </FormInput>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={20} />
                  Complete Registration
                </>
              )}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function StudentRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StudentRegisterForm />
    </Suspense>
  );
}
