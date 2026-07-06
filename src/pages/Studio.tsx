import { useState, useRef } from "react";
import Layout from "../layouts/Layout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  Image,
  Sparkles,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { createJob, getFirstClientId } from "../api/jobs";
import api from "../api/api";

export default function Studio() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [duration, setDuration] = useState("15 Seconds");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  const durationToShots: Record<string, number> = {
    "5 Seconds": 1,
    "10 Seconds": 2,
    "15 Seconds": 3,
    "20 Seconds": 4,
    "30 Seconds": 6,
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setReferencePreview(dataUrl);
      setReferenceImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setReferencePreview(dataUrl);
      setReferenceImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe your video before generating.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const clientId = await getFirstClientId();
      const num_shots = durationToShots[duration] || 3;

      // If reference image uploaded, analyze it with GPT vision first
      let imageDescription = "";
      if (referenceImage) {
        try {
          const res = await api.post("/api/v1/images/analyze", {
            image_data_url: referenceImage,
          });
          imageDescription = res.data.description || "";
        } catch (e) {
          console.warn("Vision analysis failed, continuing without it");
        }
      }

      const briefText = imageDescription
        ? `${prompt} | Style: ${style} | Duration: ${duration} | Product details from reference image: ${imageDescription}`
        : referenceImage
        ? `${prompt} | Style: ${style} | Duration: ${duration} | Reference image provided by client`
        : `${prompt} | Style: ${style} | Duration: ${duration}`;

      const job = await createJob({
        client_id: clientId,
        name: prompt.slice(0, 60) || "New Video Project",
        brief_text: briefText,
        mode: "standard",
        job_type: "studio",
        num_shots,
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
              Upload Reference Image (optional)
            </h2>

            {referencePreview ? (
              <div className="relative rounded-3xl overflow-hidden h-72">
                <img src={referencePreview} alt="Reference"
                  className="w-full h-full object-cover" />
                <button
                  onClick={() => { setReferencePreview(null); setReferenceImage(null); }}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-red-500 rounded-full p-2 transition"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-xs text-green-400">
                  Reference image added
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-violet-500 rounded-3xl h-72 flex flex-col justify-center items-center cursor-pointer hover:border-violet-400 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={42} className="text-violet-400" />
                <p className="mt-5 text-lg">Drag & Drop Image</p>
                <p className="text-gray-500 text-sm mt-2">or click to browse</p>
                <button className="mt-6 bg-violet-600 px-6 py-3 rounded-xl">
                  Browse Files
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

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

                  <option>5 Seconds</option>
                  <option>10 Seconds</option>
                  <option>15 Seconds</option>
                  <option>20 Seconds</option>
                  <option>30 Seconds</option>

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