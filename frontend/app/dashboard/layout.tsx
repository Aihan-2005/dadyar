// "use client";

// import DashboardSidebar from "@/components/dashboard/sidebar";
// import { DashboardHeader } from "@/components/dashboard/header";
// import AuthGuard  from "@/components/auth-guard";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <AuthGuard>
//       <div className="flex min-h-screen bg-zinc-50" dir="rtl">
//         <DashboardSidebar />
//         <div className="flex-1 flex flex-col">
//           <DashboardHeader />
//           <main className="flex-1 p-6 overflow-auto">{children}</main>
//         </div>
//       </div>
//     </AuthGuard>
//   );
// }

"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

import AuthGuard from "@/components/auth-guard";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-zinc-50" dir="rtl">

        {/* دکمه همبرگر برای موبایل */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md border border-zinc-200"
          aria-label="باز کردن منو"
        >
          <Menu size={24} className="text-zinc-700" />
        </button>

        <DashboardSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
         
          <main className="flex-1 p-6 overflow-auto pt-16 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
