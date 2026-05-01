'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative flex flex-col"
      style={{ fontFamily: "var(--font-vazirmatn), 'Segoe UI', sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          نسل جدید مدیریت پرونده‌های حقوقی با کمک دادیار
        </div>

        <h1
          className={`text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight max-w-3xl mb-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "200ms" }}
        >
          پرونده‌هات رو{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            هوشمند
          </span>{" "}
          مدیریت کن
        </h1>

        <p
          className={`text-lg text-zinc-400 max-w-xl leading-relaxed mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "350ms" }}
        >
          دادیار ابزار حرفه‌ای وکلاست — ثبت پرونده، قرارداد مرحله‌ای،
          مدیریت مالی و یادآوری جلسات، همه در یک پنل متمرکز.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-2 h-13 px-8 rounded-full font-bold text-base overflow-hidden"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
          >
            <span className="relative z-10">ورود موکلین </span>
            <span className="relative z-10 text-lg">←</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)" }}
            />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center h-13 px-8 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:border-white/25 hover:bg-white/5 font-medium text-base transition-all duration-200"
          >
           ورود وکلا
          </Link>
        </div>

        <p
          className={`mt-8 text-xs text-zinc-600 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "700ms" }}
        >
          بیش از ۵۰۰۰ وکیل از دادیار استفاده می‌کنند
        </p>
      </main>

      <section id="features" className="relative z-10 border-t border-white/5 px-8 py-0">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📁",
              title: "مدیریت پرونده",
              desc: "ثبت، دسته‌بندی و پیگیری تمام پرونده‌ها در یک نگاه",
            },
            {
              icon: "📅",
              title: "یادآور هوشمند",
              desc: "هرگز جلسه یا مهلت قانونی مهمی را از دست نده",
            },
            {
              icon: "💼",
              title: "قرارداد مرحله‌ای",
              desc: "مدیریت مالی پرونده با تعریف مراحل و دریافت‌های هر مرحله",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-zinc-600">
        <span>© ۱۴۰۴ دادیار — تمام حقوق محفوظ است</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">حریم خصوصی</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">تماس با ما</a>
        </div>
      </footer>
    </div>
  );
}
