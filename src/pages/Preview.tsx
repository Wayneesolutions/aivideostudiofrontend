import Layout from "../layouts/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, RotateCcw, FolderOpen, Home, Film, Play } from "lucide-react";
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
  const [selectedRatio, setSelectedRatio] = useState<string>("9:16");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!jobId) { setLoading(false); return; }
    getJob(jobId)
      .then((data) => {
        setJob(data);
        // Auto-select first available ratio
        if (data.final_urls) {
          const ratios = Object.keys(data.final_urls);
          if (ratios.length > 0) setSelectedRatio(ratios[0]);
        }
      })
      .catch((err) => console.error("Failed to load job:", err))
      .finally(() => setLoading(false));
  }, [jobId]);

  const finalUrls = job?.final_urls as Record<string, string> | null;
  const currentUrl = finalUrls?.[selectedRatio] || null;
  const isLocalVideo = currentUrl?.includes("127.0.0.1") || currentUrl?.includes("localhost");

  // Fix download for cross-origin local videos
  const handleDownload = async () => {
    if (!currentUrl) return;
    setDownloading(true);
    try {
      if (isLocalVideo) {
        // Fetch the video as blob then trigger download
        const response = await fetch(currentUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `wayne-ai-video-${selectedRatio.replace(":", "x")}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        // External URL — open in new tab
        window.open(currentUrl, "_blank");
      }
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback — open in new tab
      window.open(currentUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

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
            ) : currentUrl && isLocalVideo ? (
              // Show real video player for local videos
              <video
                key={currentUrl}
                controls
                autoPlay={false}
                className="h-full max-w-full rounded-2xl"
                src={currentUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : currentUrl ? (
              // External URL — show link
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
                  <Film size={42} className="text-violet-400" />
                </div>
                <h2 className="text-3xl font-bold">Video Ready</h2>
                <p className="text-gray-400 mt-3">Click Preview to watch your video.</p>
                <a href={currentUrl} target="_blank" rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl">
                  <Play size={18} /> Watch Video
                </a>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
                  <Film size={42} className="text-violet-400" />
                </div>
                <h2 className="text-3xl font-bold">Video Ready</h2>
                <p className="text-gray-400 mt-3">Select a ratio below to preview.</p>
              </div>
            )}
          </div>

          {/* Ratio selector */}
          {finalUrls && Object.keys(finalUrls).length > 0 && (
            <div className="p-5 border-t border-white/10 flex gap-3 justify-center">
              {Object.entries(finalUrls).map(([ratio, url]) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                    selectedRatio === ratio
                      ? "bg-violet-600 text-white"
                      : "bg-[#060816] border border-white/10 text-gray-400 hover:border-violet-500"
                  } ${url.includes("stub-cdn") ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={url.includes("stub-cdn")}
                >
                  {ratio}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Job details */}
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

          <button
            onClick={handleDownload}
            disabled={!currentUrl || downloading || currentUrl.includes("stub-cdn")}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl py-4 flex items-center justify-center gap-3 transition"
          >
            <Download />
            {downloading ? "Downloading..." : "Download"}
          </button>

          <button
            onClick={() => navigate("/studio")}
            className="bg-[#101522] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-3 hover:border-violet-500"
          >
            <RotateCcw />
            New Video
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
