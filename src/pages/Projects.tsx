import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, FolderOpen, PlayCircle, ImageIcon, Film } from "lucide-react";
import { listJobs } from "../api/jobs";
import type { Job } from "../api/jobs";
import api from "../api/api";

interface ImageGen {
  id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
}

type ProjectItem =
  | { type: "video"; data: Job }
  | { type: "image"; data: ImageGen };

function toStatusLabel(state: string): string {
  if (state === "DONE") return "Completed";
  if (state === "FAILED") return "Failed";
  if (state === "CREATED") return "Draft";
  return "Rendering";
}

function toRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function Projects() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [filtered, setFiltered] = useState<ProjectItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listJobs(),
      api.get("/api/v1/images/history?limit=50").then(r => r.data).catch(() => []),
    ]).then(([jobs, images]) => {
      const videoItems: ProjectItem[] = jobs.map(j => ({ type: "video" as const, data: j }));
      const imageItems: ProjectItem[] = (images as ImageGen[]).map(img => ({ type: "image" as const, data: img }));
      const all = [...videoItems, ...imageItems].sort((a, b) => {
        const dateA = a.type === "video" ? a.data.created_at : a.data.created_at;
        const dateB = b.type === "video" ? b.data.created_at : b.data.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      setItems(all);
      setFiltered(all);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = items;
    if (filter !== "all") result = result.filter(i => i.type === filter);
    if (search.trim()) {
      result = result.filter(i => {
        const name = i.type === "video" ? i.data.name : i.data.prompt;
        return name.toLowerCase().includes(search.toLowerCase());
      });
    }
    setFiltered(result);
  }, [search, filter, items]);

  return (
    <Layout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold">Projects</h1>
            <p className="text-gray-400 mt-3">All your AI video and image projects.</p>
          </div>
          <button onClick={() => navigate("/studio")}
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 px-7 py-4 rounded-2xl">
            <Plus /> New Project
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input placeholder="Search projects..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#101522] border border-white/10 rounded-2xl py-4 pl-14 pr-5 outline-none" />
          </div>
          <div className="flex gap-2">
            {(["all", "video", "image"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-4 rounded-2xl capitalize text-sm font-medium transition ${filter === f ? "bg-violet-600" : "bg-[#101522] border border-white/10 hover:border-violet-500"}`}>
                {f === "all" ? "All" : f === "video" ? "Videos" : "Images"}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-gray-500 text-center py-10">Loading projects...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            {search || filter !== "all" ? "No projects match your search." : "No projects yet — create your first one above."}
          </p>
        )}

        <div className="grid grid-cols-2 gap-6">
          {filtered.map((item) => {
            if (item.type === "video") {
              const job = item.data;
              const status = toStatusLabel(job.state);
              return (
                <motion.div key={job.job_id} whileHover={{ y: -5 }}
                  className="bg-[#101522] border border-white/10 rounded-3xl p-7">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center">
                      <Film size={26} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Video</span>
                      <span className={`px-4 py-2 rounded-full text-sm ${
                        status === "Completed" ? "bg-green-500/20 text-green-400" :
                        status === "Rendering" ? "bg-yellow-500/20 text-yellow-400" :
                        status === "Failed" ? "bg-red-500/20 text-red-400" :
                        "bg-gray-500/20 text-gray-300"}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mt-6 truncate">{job.name}</h2>
                  <p className="text-gray-400 mt-3">Last Updated • {toRelativeDate(job.updated_at || job.created_at)}</p>
                  <button onClick={() => navigate(`/preview?job_id=${job.job_id}`)}
                    className="mt-8 w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-xl flex items-center justify-center gap-2">
                    <PlayCircle size={18} /> Open Project
                  </button>
                </motion.div>
              );
            } else {
              const img = item.data;
              return (
                <motion.div key={img.id} whileHover={{ y: -5 }}
                  className="bg-[#101522] border border-white/10 rounded-3xl p-7">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-800 flex items-center justify-center">
                      <ImageIcon size={26} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Image</span>
                      <span className="px-4 py-2 rounded-full text-sm bg-green-500/20 text-green-400">Generated</span>
                    </div>
                  </div>
                  {/* Image thumbnail */}
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                    <img src={img.image_url} alt={img.prompt}
                      className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-lg font-semibold truncate">{img.prompt}</h2>
                  <p className="text-gray-400 mt-1 text-sm">{img.style} • {toRelativeDate(img.created_at)}</p>
                  <div className="flex gap-3 mt-6">
                    <a href={img.image_url} target="_blank" rel="noreferrer"
                      className="flex-1 bg-violet-600 hover:bg-violet-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <FolderOpen size={16} /> View
                    </a>
                    <a href={img.image_url} download
                      className="flex-1 bg-[#060816] border border-white/10 hover:border-violet-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      Download
                    </a>
                  </div>
                </motion.div>
              );
            }
          })}
        </div>
      </div>
    </Layout>
  );
}
