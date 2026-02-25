import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f1012] text-white font-display antialiased overflow-hidden relative">
      <div className="flex-1 overflow-y-auto pb-[72px]">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-[#16161a]/95 backdrop-blur-md border-t border-white/5 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
          <NavItem to="/home" icon="home" label="首頁" />
          <NavItem to="/parcels" icon="package_2" label="包裹" />
          <NavItem to="/forecast" icon="edit_document" label="預報" />
          <NavItem to="/quote" icon="currency_yen" label="報價" />
          <NavItem to="/profile" icon="person" label="我的" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 group relative",
          isActive ? "text-[#f48c25]" : "text-gray-500 hover:text-gray-300"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute top-0 w-8 h-0.5 bg-[#f48c25] rounded-b-sm shadow-[0_0_8px_rgba(244,140,37,0.6)]"></div>
          )}
          <span className={cn("material-symbols-outlined text-2xl", isActive && "font-semibold")}>{icon}</span>
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}
