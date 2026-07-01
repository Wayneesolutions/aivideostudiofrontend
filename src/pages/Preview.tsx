import Layout from "../layouts/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, RotateCcw, FolderOpen, Home, Film } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getJob } from "../api/jobs";
import type { JobDetail } from "../api/jobs";

export default function Preview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job_id");

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) { setLoading(false); return; }
    getJob(jobId)
      .then(setJob)
      .catch((err) => console.error("Failed to load job:", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  const finalUrls = job?.final_urls as Record<string, string> | null;
  const primaryUrl = finalUrls?.["9:16"] || finalUrls?.["16:9"] || finalUrls?.["1:1"] || null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold">Video Preview</h1>

        <p className="text-gray-400 mt-3">
          {job ? `${job.name} — Ready` : "Your AI generated video is ready."}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 rounded-3xl overflow-hidden bg-[#101522] border border-white/10"
        >
          <div className="h-[420px] flex items-center justify-center bg-gradient-to-br from-violet-600/20 to-purple-700/20">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : primaryUrl ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5"><Film size={42} className="text-violet-400" /></div>
                <h2 className="text-3xl font-bold">Video Ready</h2>
                <p className="text-gray-400 mt-3">Click Download to save your video.</p>
                {finalUrls && (
                  <div className="flex gap-3 mt-6 justify-center">
                    {Object.entries(finalUrls).map(([ratio, url]) => (
                      <a key={ratio} href={url} target="_blank" rel="noreferrer"
                        className="bg-violet-600/30 border border-violet-500 px-4 py-2 rounded-xl text-sm hover:bg-violet-600/50">
                        {ratio}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5"><Film size={42} className="text-violet-400" /></div>
                <h2 className="text-3xl font-bold">Video Ready</h2>
                <p className="text-gray-400 mt-3">
                  Replace this with the generated video later.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Job details if available */}
        {job && (
          <div className="mt-6 bg-[#101522] border border-white/10 rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Total Shots</p>
              <p className="text-2xl font-bold mt-1">{job.shots.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Est. Cost</p>
              <p className="text-2xl font-bold mt-1">${job.est_cost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Quality</p>
              <p className="text-2xl font-bold mt-1 capitalize">{job.mode}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-5 mt-10">

          <a
            href={primaryUrl || "#"}
            download="wayne-ai-video.mp4"
            className={`bg-violet-600 hover:bg-violet-700 rounded-2xl py-4 flex items-center justify-center gap-3 ${!primaryUrl ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Download />
            Download
          </a>

          <button
            onClick={() => navigate("/studio")}
            className="bg-[#101522] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-3 hover:border-violet-500"
          >
            <RotateCcw />
            Generate Again
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="bg-[#101522] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-3 hover:border-violet-500"
          >
            <FolderOpen />
            Projects
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#101522] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-3 hover:border-violet-500"
          >
            <Home />
            Dashboard
          </button>

        </div>

      </div>
    </Layout>
  );
}
