import { Outlet } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {/* Mobile Container - Full screen on mobile */}
      <div className="flex-1 flex flex-col max-w-[430px] mx-auto w-full bg-white min-h-screen relative shadow-xl">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          <Outlet />
        </main>

        {/* Bottom Navigation - Fixed within container */}
        <BottomNavigation />
      </div>
    </div>
  );
}
