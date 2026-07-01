import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-20 bg-[#090B14] border-b border-white/10 flex items-center justify-between px-8">

      <div className="relative w-96">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="text"
          placeholder="Search projects..."
          className="w-full bg-[#141827] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none text-white placeholder:text-gray-500"
        />

      </div>

      <div className="flex items-center gap-6">

        <button className="relative">

          <Bell className="text-gray-300" />

          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>

        </button>

        <div className="flex items-center gap-3">

          <UserCircle size={40} />

          <div>

            <h3 className="font-semibold">

              Wayne Admin

            </h3>

            <p className="text-sm text-gray-400">

              Internal Dashboard

            </p>

          </div>

        </div>

      </div>

    </header>
  );
}