import { Outlet } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {/* Mobile Container - Full screen on mobile */}
      <div className="flex-1 flex flex-col max-w-[430px] mx-auto w-full bg-white min-h-screen relative shadow-xl">
        {/* Status Bar Spacer */}
        <div className="h-12 bg-white flex items-center justify-center flex-shrink-0">
          <div className="w-[100px] h-[28px] bg-black rounded-full" />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-24">
          <Outlet />
        </main>

        {/* Bottom Navigation - Fixed within container */}
        <BottomNavigation />
      </div>
    </div>
  );
}
