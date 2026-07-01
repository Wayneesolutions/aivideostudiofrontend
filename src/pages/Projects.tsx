import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FolderOpen,
  PlayCircle,
} from "lucide-react";
import { listJobs } from "../api/jobs";
import type { Job } from "../api/jobs";

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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listJobs()
      .then((data) => {
        setJobs(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Failed to load projects:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(jobs);
    } else {
      setFiltered(
        jobs.filter((j) =>
          j.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, jobs]);

  return (
    <Layout>

      <div className="space-y-8">

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-5xl font-bold">

              Projects

            </h1>

            <p className="text-gray-400 mt-3">

              Manage all AI video projects.

            </p>

          </div>

          <button
            onClick={() => navigate("/studio")}
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 px-7 py-4 rounded-2xl"
          >

            <Plus />

            New Project

          </button>

        </div>

        <div className="relative">

          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101522] border border-white/10 rounded-2xl py-4 pl-14 pr-5 outline-none"
          />

        </div>

        {loading && (
          <p className="text-gray-500 text-center py-10">Loading projects...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            {search ? "No projects match your search." : "No projects yet — create your first one above."}
          </p>
        )}

        <div className="grid grid-cols-2 gap-6">
          {filtered.map((job) => {
            const status = toStatusLabel(job.state);
            return (
              <motion.div
                key={job.job_id}
                whileHover={{ y: -5 }}
                className="bg-[#101522] border border-white/10 rounded-3xl p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center">
                    <FolderOpen size={28} />
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm ${
                      status === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : status === "Rendering"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : status === "Failed"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold mt-6">{job.name}</h2>

                <p className="text-gray-400 mt-3">Last Updated • {toRelativeDate(job.updated_at || job.created_at)}</p>

                <button
                  onClick={() => navigate("/studio")}
                  className="mt-8 w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <PlayCircle size={18} />
                  Open Project
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}