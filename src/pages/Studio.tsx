import { useState } from "react";
import Layout from "../layouts/Layout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  Image,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { createJob, getFirstClientId } from "../api/jobs";

export default function Studio() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [duration, setDuration] = useState("30 Seconds");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe your video before generating.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const clientId = await getFirstClientId();

      const job = await createJob({
        client_id: clientId,
        name: prompt.slice(0, 60) || "New Video Project",
        brief_text: `${prompt} | Style: ${style} | Duration: ${duration}`,
        mode: "economy",
        job_type: "studio",
      });

      navigate(`/quality?job_id=${job.job_id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create job. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto"
      >

        <h1 className="text-5xl font-bold">

          Create AI Video

        </h1>

        <p className="text-gray-400 mt-3">

          Upload your image and generate professional AI videos.

        </p>

        <div className="mt-10 grid grid-cols-2 gap-8">

          {/* Upload */}

          <div className="bg-[#101522] border border-white/10 rounded-3xl p-8">

            <h2 className="text-2xl font-semibold mb-6">

              Upload Image

            </h2>

            <div className="border-2 border-dashed border-violet-500 rounded-3xl h-72 flex flex-col justify-center items-center">

              <Upload
                size={42}
                className="text-violet-400"
              />

              <p className="mt-5 text-lg">

                Drag & Drop Image

              </p>

              <button className="mt-6 bg-violet-600 px-6 py-3 rounded-xl">

                Browse Files

              </button>

            </div>

          </div>

          {/* Settings */}

          <div className="bg-[#101522] border border-white/10 rounded-3xl p-8">

            <h2 className="text-2xl font-semibold">

              Video Settings

            </h2>

            <div className="space-y-6 mt-8">

              <div>

                <label className="text-gray-400">

                  Prompt

                </label>

                <textarea
                  rows={5}
                  placeholder="Describe your video..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2 w-full bg-[#060816] border border-white/10 rounded-xl p-4 outline-none"
                />

              </div>

              <div>

                <label className="text-gray-400">

                  Animation Style

                </label>

                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="mt-2 w-full bg-[#060816] border border-white/10 rounded-xl p-4"
                >

                  <option>Cinematic</option>
                  <option>Realistic</option>
                  <option>Product Showcase</option>
                  <option>Advertisement</option>

                </select>

              </div>

              <div>

                <label className="text-gray-400">

                  Duration

                </label>

                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-2 w-full bg-[#060816] border border-white/10 rounded-xl p-4"
                >

                  <option>15 Seconds</option>
                  <option>30 Seconds</option>
                  <option>60 Seconds</option>

                </select>

              </div>

              <div className="grid grid-cols-3 gap-4">

                <div className="bg-[#060816] border border-white/10 rounded-2xl p-5 text-center">

                  <Image className="mx-auto text-violet-400" />

                  <p className="mt-3 text-sm">

                    Image Input

                  </p>

                </div>

                <div className="bg-[#060816] border border-white/10 rounded-2xl p-5 text-center">

                  <Sparkles className="mx-auto text-yellow-400" />

                  <p className="mt-3 text-sm">

                    AI Enhanced

                  </p>

                </div>

                <div className="bg-[#060816] border border-white/10 rounded-2xl p-5 text-center">

                  <Video className="mx-auto text-green-400" />

                  <p className="mt-3 text-sm">

                    HD Output

                  </p>

                </div>

              </div>

              <div className="bg-violet-600/20 border border-violet-500 rounded-2xl p-5">

                <div className="flex items-center gap-3">

                  <Wand2 className="text-violet-400" />

                  <h3 className="font-semibold">

                    AI Assistant

                  </h3>

                </div>

                <p className="text-gray-300 mt-3 leading-7">

                  Wayne AI will automatically optimize your prompt,
                  improve animation quality and generate a professional
                  marketing video.

                </p>

              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed py-4 rounded-2xl text-lg font-semibold transition"
              >

                {loading ? "Creating Project..." : "Generate Video"}

              </button>

            </div>

          </div>

        </div>

      </motion.div>

    </Layout>

  );
}