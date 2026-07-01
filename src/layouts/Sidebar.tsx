import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Clapperboard,
  Film,
  Settings,
  Sparkles,
  ImageIcon,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const menu = [
  { title: "Dashboard",         icon: LayoutDashboard, path: "/dashboard"    },
  { title: "Projects",          icon: FolderKanban,    path: "/projects"     },
  { title: "Create Video",      icon: Clapperboard,    path: "/studio"       },
  { title: "Smart Video Studio",icon: Film,            path: "/smart-video"  },
  { title: "AI Image Studio",   icon: ImageIcon,       path: "/image-studio" },
  { title: "Settings",          icon: Settings,        path: "/settings"     },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="w-72 bg-[#090B14] border-r border-white/10 flex flex-col justify-between h-screen sticky top-0">

      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="ml-4">
            <h2 className="font-bold text-lg leading-tight">Wayne AI</h2>
            <p className="text-xs text-gray-400">Video Studio</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                    isActive
                      ? "bg-violet-600 text-white font-semibold"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="p-4 space-y-3 border-t border-white/10">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4">
          <h3 className="font-semibold text-sm">Wayne E Solutions</h3>
          <p className="text-xs text-violet-200 mt-1">Internal AI Video Platform</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}
