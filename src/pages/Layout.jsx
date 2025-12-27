
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Stethoscope } from "lucide-react";
import {
  SidebarProvider,
  Sidebar } from
"@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarNavigation from "../components/layout/SidebarNavigation";


export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    User.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-slate-900">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Desktop Sidebar */}
          <Sidebar className="hidden md:flex flex-col border-r border-slate-200 bg-white/80 backdrop-blur-sm">
            <SidebarNavigation currentUser={currentUser} />
          </Sidebar>
          
          <main className="flex-1 flex flex-col min-h-screen">
             {/* Mobile Header */}
             <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-slate-900 text-md">OsteoScope</h1>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <button className="p-2 rounded-md hover:bg-slate-100">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                       </svg>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[320px] bg-white/90 backdrop-blur-sm flex flex-col">
                    <SidebarNavigation currentUser={currentUser} />
                  </SheetContent>
                </Sheet>
             </div>
             
             {/* Desktop Header Navigation */}
             <div className="hidden md:flex items-center justify-between border-b border-blue-800 bg-blue-950 backdrop-blur-sm px-6 py-3 sticky top-0 z-10">
               <div className="flex items-center gap-6">
                 <Link to={createPageUrl("Dashboard")} className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium">
                   Dashboard
                 </Link>
                 <Link to={createPageUrl("Upload")} className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium">
                   Upload Study
                 </Link>
                 <Link to={createPageUrl("Reports")} className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium">
                   Reports
                 </Link>
                 <Link to={createPageUrl("Analytics")} className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium">
                   Analytics
                 </Link>
                 <Link to={createPageUrl("Patients")} className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium">
                   Patients
                 </Link>
                 {currentUser?.role === 'admin' && (
                   <Link to={createPageUrl("Admin")} className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium">
                     Admin Panel
                   </Link>
                 )}
               </div>
             </div>

             {/* Main content area */}
             <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-blue-950 to-slate-900">
               {children}
             </div>
             
             {/* Footer */}
             <footer className="border-t border-blue-800 bg-blue-950 px-6 py-4 text-center">
               <p className="text-sm text-blue-200">
                 <strong>© 2025 Built by Asma Ahmed</strong>
               </p>
             </footer>
          </main>
        </div>
      </SidebarProvider>
    </div>);

}
