import Layout from "../layouts/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Film, Sparkles, Package, UtensilsCrossed, Home, Smartphone,
  CheckCircle, Image, Video, Download, Play,
  ListChecks, Layers, Clapperboard
} from "lucide-react";
import { createJob, getFirstClientId, pollUntil, postMessage } from "../api/jobs";
import type { Shot } from "../api/jobs";

export default function SmartVideo() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [videoType, setVideoType] = useState("Advertisement");
  const [imageCount, setImageCount] = useState("5");
  const [duration, setDuration] = useState("30 Seconds");

  const [jobId, setJobId] = useState<string | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [finalUrls, setFinalUrls] = useState<Record<string, string> | null>(null);

  const [loading, setLoading] = useState(false);
  const [storyboardReady, setStoryboardReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [assemblingVideo, setAssemblingVideo] = useState(false);
  const [error, setError] = useState("");

  const generateStoryboard = async () => {
    if (prompt.trim() === "") {
      setError("Please enter a prompt.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const clientId = await getFirstClientId();
      const job = await createJob({
        client_id: clientId,
        name: prompt.slice(0, 60),
        brief_text: `${prompt} | Type: ${videoType} | Images: ${imageCount} | Duration: ${duration}`,
        mode: "economy",
        job_type: "smart_video",
      });
      setJobId(job.job_id);
      const detail = await pollUntil(job.job_id, ["SHOTLIST_READY"]);
      if (detail.state === "FAILED") {
        setError("Storyboard generation failed. Please try again.");
        return;
      }
      setShots(detail.shots);
      setStoryboardReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const generateImages = async () => {
    if (!storyboardReady || !jobId) return;
    setError("");
    setGeneratingImages(true);
    try {
      await postMessage(jobId, "yes");
      const detail = await pollUntil(jobId, ["FRAMES_READY"]);
      if (detail.state === "FAILED") {
        setError("Image generation failed. Please try again.");
        return;
      }
      setShots(detail.shots);
      setImagesReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGeneratingImages(false);
    }
  };

  const assembleVideo = async () => {
    if (!imagesReady || !jobId) return;
    setError("");
    setAssemblingVideo(true);
    try {
      await postMessage(jobId, "yes");
      const clipsDetail = await pollUntil(jobId, ["CLIPS_READY"]);
      if (clipsDetail.state === "FAILED") {
        setError("Rendering failed. Please try again.");
        return;
      }
      await postMessage(jobId, "yes");
      const finalDetail = await pollUntil(jobId, ["DONE"]);
      if (finalDetail.state === "FAILED") {
        setError("Assembly failed. Please try again.");
        return;
      }
      setFinalUrls(finalDetail.final_urls);
      setVideoReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAssemblingVideo(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold">Smart Video Studio</h1>

        <p className="text-gray-400 mt-3">
          Generate marketing videos using AI generated images and automatic video assembly.
        </p>

        <div className="grid grid-cols-2 gap-8 mt-10">

          {/* LEFT PANEL */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">

            <h2 className="text-2xl font-semibold mb-6">Video Settings</h2>

            <label className="font-medium">Prompt</label>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the marketing video..."
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-2xl p-4 resize-none outline-none"
            />

            <h3 className="mt-8 font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              Quick Templates
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => setPrompt("Create a luxury product advertisement.")}
                className="bg-[#060816] rounded-xl p-3 border border-white/10 hover:border-violet-500 flex items-center gap-2 text-sm">
                <Package size={16} className="text-violet-400 shrink-0" /> Product Ad
              </button>
              <button onClick={() => setPrompt("Create a restaurant promotion video.")}
                className="bg-[#060816] rounded-xl p-3 border border-white/10 hover:border-violet-500 flex items-center gap-2 text-sm">
                <UtensilsCrossed size={16} className="text-violet-400 shrink-0" /> Restaurant
              </button>
              <button onClick={() => setPrompt("Create a real estate property showcase.")}
                className="bg-[#060816] rounded-xl p-3 border border-white/10 hover:border-violet-500 flex items-center gap-2 text-sm">
                <Home size={16} className="text-violet-400 shrink-0" /> Real Estate
              </button>
              <button onClick={() => setPrompt("Create an Instagram reel for a product.")}
                className="bg-[#060816] rounded-xl p-3 border border-white/10 hover:border-violet-500 flex items-center gap-2 text-sm">
                <Smartphone size={16} className="text-violet-400 shrink-0" /> Reel
              </button>
            </div>

            <label className="block mt-8 font-medium">Video Type</label>
            <select value={videoType} onChange={(e) => setVideoType(e.target.value)}
              className="mt-3 w-full bg-[#060816] rounded-xl border border-white/10 p-4">
              <option>Advertisement</option>
              <option>Marketing</option>
              <option>Educational</option>
              <option>Real Estate</option>
              <option>Product Showcase</option>
            </select>

            <label className="block mt-8 font-medium">Number of AI Images</label>
            <select value={imageCount} onChange={(e) => setImageCount(e.target.value)}
              className="mt-3 w-full bg-[#060816] rounded-xl border border-white/10 p-4">
              <option>5</option>
              <option>8</option>
              <option>10</option>
              <option>15</option>
            </select>

            <label className="block mt-8 font-medium">Video Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}
              className="mt-3 w-full bg-[#060816] rounded-xl border border-white/10 p-4">
              <option>15 Seconds</option>
              <option>30 Seconds</option>
              <option>60 Seconds</option>
            </select>

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <button
              onClick={generateStoryboard}
              disabled={loading || storyboardReady}
              className={`mt-10 w-full rounded-2xl py-4 font-semibold transition ${
                loading || storyboardReady
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              <Sparkles className="inline mr-2" size={20} />
              {loading ? "Generating Storyboard..." : storyboardReady ? "Storyboard Created" : "Generate Storyboard"}
            </button>

          </div>

          {/* RIGHT PANEL */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">

            {storyboardReady ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold">Storyboard Ready</h2>
                </div>
                <p className="text-gray-400 mt-2">AI has prepared the storyboard.</p>

                <div className="space-y-4 mt-8">
                  {shots.map((shot, i) => (
                    <div key={shot.idx} className="bg-[#060816] rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-violet-400 mb-2">
                        <Clapperboard size={15} />
                        Scene {i + 1}
                      </div>
                      <p className="text-gray-400 text-sm">{shot.description}</p>
                      {shot.frame_url && (
                        <img src={shot.frame_url} alt={`Scene ${i + 1}`}
                          className="mt-3 w-full h-32 object-cover rounded-lg opacity-80" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button onClick={generateImages} disabled={generatingImages || imagesReady}
                    className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 rounded-xl py-3 font-semibold flex items-center justify-center gap-2">
                    <Image size={16} />
                    {generatingImages ? "Generating..." : imagesReady ? "Images Ready" : "Generate Images"}
                  </button>

                  <button onClick={assembleVideo} disabled={!imagesReady || assemblingVideo || videoReady}
                    className="bg-[#060816] border border-white/10 disabled:opacity-40 rounded-xl py-3 font-semibold hover:border-violet-500 flex items-center justify-center gap-2">
                    <Layers size={16} />
                    {assemblingVideo ? "Assembling..." : videoReady ? "Assembled" : "Assemble Video"}
                  </button>

                  <button onClick={() => navigate('/preview?job_id=' + jobId)}
                    className={`text-center bg-[#060816] border border-white/10 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 ${!videoReady ? "opacity-40 pointer-events-none" : "hover:border-violet-500"}`}>
                    <Play size={16} /> Preview
                  </button>

                  <button onClick={() => navigate('/preview?job_id=' + jobId)}
                    className={`text-center bg-[#060816] border border-white/10 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 ${!videoReady ? "opacity-40 pointer-events-none" : "hover:border-violet-500"}`}>
                    <Download size={16} /> Download
                  </button>
                </div>

                <div className="mt-8 bg-[#060816] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ListChecks size={18} className="text-violet-400" />
                    Pipeline Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm"><Clapperboard size={14} className="text-gray-400" /> Storyboard</span>
                      <span className={`text-sm font-medium ${storyboardReady ? "text-green-400" : "text-gray-500"}`}>{storyboardReady ? "Ready" : "Waiting"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm"><Image size={14} className="text-gray-400" /> AI Images</span>
                      <span className={`text-sm font-medium ${imagesReady ? "text-green-400" : generatingImages ? "text-yellow-400" : "text-gray-500"}`}>{imagesReady ? "Generated" : generatingImages ? "Generating..." : "Waiting"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm"><Video size={14} className="text-gray-400" /> Video Assembly</span>
                      <span className={`text-sm font-medium ${videoReady ? "text-green-400" : assemblingVideo ? "text-yellow-400" : "text-gray-500"}`}>{videoReady ? "Completed" : assemblingVideo ? "Assembling..." : "Waiting"}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Film size={90} className="mx-auto text-violet-400" />
                <h2 className="text-3xl font-bold mt-6">Storyboard Preview</h2>
                <p className="text-gray-400 mt-4">
                  Your storyboard will appear here after generation.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </Layout>
  );
}
