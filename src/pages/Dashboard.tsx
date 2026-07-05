import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Clock3,
  Sparkles,
  ArrowRight,
  PlayCircle,
  ImageIcon,
} from "lucide-react";
import { getDashboardStats } from "../api/dashboard";
import type { RecentProject } from "../api/dashboard";

// Backend job states aren't the same words the UI badge expects —
// map them to the three labels the existing styling already handles.
function toStatusLabel(state: string): string {
  if (state === "DONE") return "Completed";
  if (state === "FAILED") return "Failed";
  if (state === "CREATED") return "Draft";
  return "Rendering"; // every in-progress state (PLANNING, GENERATING_FRAMES, etc.)
}

function toRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [totalProjects, setTotalProjects] = useState(0);
  const [videosGenerated, setVideosGenerated] = useState(0);
  const [aiStatus, setAiStatus] = useState("Online");
  const [projects, setProjects] = useState<RecentProject[]>([]);
  const [recentActivity, setRecentActivity] = useState<{id: number; description: string; created_at: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((stats) => {
        if (!isMounted) return;
        setTotalProjects(stats.total_projects);
        setVideosGenerated(stats.videos_generated);
        setAiStatus(stats.ai_services_status);
        setProjects(stats.recent_projects);
        setRecentActivity(stats.recent_activity || []);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-bold">

              Welcome Back 👋

            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              Create AI powered videos for Wayne E Solutions.

            </p>

          </div>

          <button
            onClick={() => navigate("/studio")}
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 px-7 py-4 rounded-2xl transition"
          >
            <Plus />

            New Project
          </button>
        </div>

        {/* Stats */}

       <div className="grid grid-cols-4 gap-6">
          <div className="rounded-3xl bg-[#101522] border border-white/10 p-7">

            <FolderOpen
              className="text-violet-400"
              size={32}
            />

            <h2 className="text-4xl font-bold mt-5">

              {loading ? "—" : totalProjects}

            </h2>

            <p className="text-gray-400 mt-2">

              Total Projects

            </p>

          </div>

          <div className="rounded-3xl bg-[#101522] border border-white/10 p-7">

            <PlayCircle
              className="text-green-400"
              size={32}
            />

            <h2 className="text-4xl font-bold mt-5">

              {loading ? "—" : videosGenerated}

            </h2>

            <p className="text-gray-400 mt-2">

              Videos Generated

            </p>

          </div>

          <div className="rounded-3xl bg-[#101522] border border-white/10 p-7">

            <Sparkles
              className="text-yellow-400"
              size={32}
            />

            <h2 className="text-4xl font-bold mt-5">

              {aiStatus}

            </h2>

            <p className="text-gray-400 mt-2">

              AI Services

            </p>

          </div>

        </div>

        {/* Recent Projects */}

        <div>

          <div className="flex justify-between items-center">

            <h2 className="text-3xl font-bold">

              Recent Projects

            </h2>

            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 text-violet-400"
            >

              View All

              <ArrowRight size={18} />

            </button>

          </div>

          <div className="mt-6 space-y-5">
                      {!loading && projects.length === 0 && (
              <p className="text-gray-500 text-center py-10">
                No projects yet — start your first one above.
              </p>
            )}

            {projects.map((project) => (

              <motion.div
                key={project.id}
                whileHover={{ y: -4 }}
                className="bg-[#101522] border border-white/10 rounded-2xl p-6 flex items-center justify-between"
              >

                <div className="flex items-center gap-5">

                  <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center">

                    <FolderOpen size={26} />

                  </div>

                  <div>

                    <h3 className="text-xl font-semibold">

                      {project.name}

                    </h3>

                    <p className="text-gray-400 mt-1">

                      Updated {toRelativeDate(project.date)}

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-5">

                  <span
                    className={`px-4 py-2 rounded-full text-sm ${
                      toStatusLabel(project.status) === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : toStatusLabel(project.status) === "Rendering"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {toStatusLabel(project.status)}
                  </span>

                  <button
                    onClick={() => navigate(`/preview?job_id=${project.id}`)}
                    className="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-xl"
                  >
                    Continue
                  </button>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

        {/* Bottom */}

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-[#101522] border border-white/10 rounded-3xl p-7">

            <h2 className="text-2xl font-bold">

              Recent Activity

            </h2>

            <div className="space-y-5 mt-6">

              {!loading && recentActivity.length === 0 && (
                <p className="text-gray-500 text-sm">No activity yet.</p>
              )}

              {recentActivity.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center gap-4"
                >

                  <div className="w-11 h-11 rounded-full bg-green-500/20 flex items-center justify-center">

                    <Clock3
                      size={18}
                      className="text-green-400"
                    />

                  </div>

                  <div>

                    <h3 className="font-medium">

                      {item.description}

                    </h3>

                    <p className="text-sm text-gray-500">

                      {toRelativeDate(item.created_at)}

                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-8">

            <h2 className="text-3xl font-bold">

              Ready to Create?

            </h2>

            <p className="mt-4 text-violet-100 leading-7">

              Create marketing videos for products, businesses,
              advertisements and social media using Wayne AI.

            </p>

            <button
              onClick={() => navigate("/studio")}
              className="mt-10 bg-white text-black px-6 py-3 rounded-xl font-semibold"
            >

              Start Creating

            </button>
<div
  onClick={() => navigate("/image-studio")}
  className="rounded-3xl bg-[#101522] border border-white/10 p-7 cursor-pointer hover:border-violet-500 hover:-translate-y-1 transition"
>

  <ImageIcon
    className="text-pink-400"
    size={32}
  />

  <h2 className="text-4xl font-bold mt-5">

    AI Images

  </h2>

  <p className="text-gray-400 mt-2">

    Generate images using AI

  </p>

</div>
          </div>

        </div>

      </motion.div>

    </Layout>

  );
}