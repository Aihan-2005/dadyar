"use client";

import DashboardSidebar from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import AuthGuard  from "@/components/auth-guard";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-zinc-50" dir="rtl">
        <DashboardSidebar
         isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
