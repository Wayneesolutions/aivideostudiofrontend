import Layout from "../layouts/Layout";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { postMessage, getJob } from "../api/jobs";

const STATE_PROGRESS: Record<string, number> = {
  CREATED: 5,
  PLANNING: 15,
  SHOTLIST_READY: 25,
  GENERATING_FRAMES: 45,
  FRAMES_READY: 60,
  RENDERING_MOTION: 75,
  CLIPS_READY: 85,
  ASSEMBLING: 92,
  EXPORTING: 97,
  DONE: 100,
  FAILED: 100,
};

const STATE_LABEL: Record<string, string> = {
  CREATED: "Setting up your project...",
  PLANNING: "Planning your video...",
  SHOTLIST_READY: "Approving storyboard...",
  GENERATING_FRAMES: "Generating AI images...",
  FRAMES_READY: "Approving frames...",
  RENDERING_MOTION: "Rendering video clips...",
  CLIPS_READY: "Approving clips...",
  ASSEMBLING: "Assembling your video...",
  EXPORTING: "Exporting final video...",
  DONE: "Video ready!",
  FAILED: "Something went wrong.",
};

export default function Generating() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job_id");

  const [progress, setProgress] = useState(5);
  const [statusLabel, setStatusLabel] = useState("Setting up your project...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) {
      // Fallback to the old 5-second fake timer
      const timer = setTimeout(() => navigate("/preview"), 5000);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    const runPipeline = async () => {
      try {
        // Approve each stage automatically as it becomes ready
        const approveStages = [
          "SHOTLIST_READY",
          "FRAMES_READY",
          "CLIPS_READY",
        ];

        let lastApproved = "";

        const poll = async () => {
          while (!cancelled) {
            const job = await getJob(jobId);
            const state = job.state;

            setProgress(STATE_PROGRESS[state] ?? 50);
            setStatusLabel(STATE_LABEL[state] ?? "Processing...");

            if (state === "DONE") {
              if (!cancelled) navigate(`/preview?job_id=${jobId}`);
              return;
            }

            if (state === "FAILED") {
              setError("Generation failed. Please go back and try again.");
              return;
            }

            // Auto-approve ready stages
            if (approveStages.includes(state) && state !== lastApproved) {
              lastApproved = state;
              await postMessage(jobId, "yes");
            }

            await new Promise((r) => setTimeout(r, 1500));
          }
        };

        await poll();
      } catch (err) {
        if (!cancelled) {
          setError("Connection error. Please check your backend is running.");
        }
      }
    };

    runPipeline();
    return () => { cancelled = true; };
  }, [jobId, navigate]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[75vh]">

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        >
          <LoaderCircle size={90} className="text-violet-500" />
        </motion.div>

        <h1 className="text-5xl font-bold mt-10">
          {error ? "Generation Failed" : "Generating Video..."}
        </h1>

        <p className="text-gray-400 mt-5 text-lg">
          {error || statusLabel}
        </p>

        <div className="mt-14 w-full max-w-xl">
          <div className="w-full h-3 rounded-full bg-[#101522] overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-violet-600"
            />
          </div>
          <p className="text-center text-gray-500 mt-3 text-sm">{progress}%</p>
        </div>

        <div className="mt-12 flex items-center gap-3 text-violet-400">
          <Sparkles />
          AI Rendering in Progress
        </div>

        {error && (
          <button
            onClick={() => navigate(-1)}
            className="mt-8 bg-violet-600 hover:bg-violet-700 px-8 py-3 rounded-xl"
          >
            Go Back
          </button>
        )}

      </div>
    </Layout>
  );
}
