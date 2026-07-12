import Layout from "../layouts/Layout";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Film, Sparkles, Package, UtensilsCrossed, Home, Smartphone,
  CheckCircle, Image, Video, Download, Play,
  ListChecks, Layers, Clapperboard, Upload, X
} from "lucide-react";
import { createJob, getFirstClientId, pollUntil, postMessage } from "../api/jobs";
import api from "../api/api";
import type { Shot } from "../api/jobs";

export default function SmartVideo() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [videoType, setVideoType] = useState("Advertisement");
  const [imageCount, setImageCount] = useState("5");
  const [duration, setDuration] = useState("30 Seconds");
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [overlayFont, setOverlayFont] = useState("Dancing Script");
  const [overlayColor, setOverlayColor] = useState("#FFFFFF");

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setLogoUrl(dataUrl);
      localStorage.setItem('smartVideoLogoUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const [jobId, setJobId] = useState<string | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [sceneTexts, setSceneTexts] = useState<string[]>([]);
  const [sceneFonts, setSceneFonts] = useState<string[]>([]);
  const [sceneColors, setSceneColors] = useState<string[]>([]);
  const sceneTextsRef = React.useRef<string[]>([]);
  const sceneFontsRef = React.useRef<string[]>([]);
  const sceneColorsRef = React.useRef<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [storyboardReady, setStoryboardReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [overlaysApplied, setOverlaysApplied] = useState(false);
  const [applyingOverlays, setApplyingOverlays] = useState(false);
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

      // Analyze reference image with GPT vision if provided
      let imageDescription = "";
      if (referenceImage) {
        try {
          const res = await api.post("/api/v1/images/analyze", {
            image_data_url: referenceImage,
          });
          imageDescription = res.data.description || "";
        } catch (e) {
          console.warn("Vision analysis failed");
        }
      }

      const briefText = imageDescription
        ? `${prompt} | Type: ${videoType} | Images: ${imageCount} | Duration: ${duration} | Product details from reference image: ${imageDescription}`
        : referenceImage
        ? `${prompt} | Type: ${videoType} | Images: ${imageCount} | Duration: ${duration} | Reference image provided by client`
        : `${prompt} | Type: ${videoType} | Images: ${imageCount} | Duration: ${duration}`;

      const job = await createJob({
        client_id: clientId,
        name: prompt.slice(0, 60),
        brief_text: briefText,
        mode: "standard",
        job_type: "smart_video",
      });
      setJobId(job.job_id);
      const detail = await pollUntil(job.job_id, ["SHOTLIST_READY"]);
      if (detail.state === "FAILED") {
        setError("Storyboard generation failed. Please try again.");
        return;
      }
      setShots(detail.shots);
      const emptyTexts = new Array(detail.shots.length).fill("");
      const defaultFonts = new Array(detail.shots.length).fill("Dancing Script");
      const defaultColors = new Array(detail.shots.length).fill("#FFFFFF");
      setSceneTexts(emptyTexts);
      setSceneFonts(defaultFonts);
      setSceneColors(defaultColors);
      sceneTextsRef.current = emptyTexts;
      sceneFontsRef.current = defaultFonts;
      sceneColorsRef.current = defaultColors;
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

  const applyOverlays = async () => {
    if (!imagesReady || !jobId) return;
    setError("");
    setApplyingOverlays(true);
    const capturedLogoUrl = localStorage.getItem('smartVideoLogoUrl') || logoUrl;
    try {
      const updatedShots = await Promise.all(
        shots.map(async (shot: Shot, i: number) => {
          const sceneText = sceneTexts[i] || "";
          const sceneFont = sceneFonts[i] || overlayFont;
          const sceneColor = sceneColors[i] || overlayColor;
          const hasLogo = !!capturedLogoUrl;
          const hasText = !!sceneText;
          if ((hasLogo || hasText) && shot.frame_url) {
            try {
              const res = await api.post("/api/v1/images/overlay", {
                image_url: shot.frame_url,
                prompt: shot.description,
                logo_url: hasLogo ? capturedLogoUrl : undefined,
                logo_position: "top-right",
                overlay_text: hasText ? sceneText : undefined,
                overlay_font: sceneFont,
                overlay_color: sceneColor,
              });
              const brandedUrl = res.data.image_url;
              await api.patch(`/api/v1/jobs/${jobId}/shots/${shot.idx}/frame?frame_url=${encodeURIComponent(brandedUrl)}`);
              return { ...shot, frame_url: brandedUrl };
            } catch (e) {
              console.warn(`Scene ${i + 1} overlay failed`);
              return shot;
            }
          }
          return shot;
        })
      );
      setShots(updatedShots);
      setOverlaysApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Overlay failed.");
    } finally {
      setApplyingOverlays(false);
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

            {/* Reference Image Upload */}
            <label className="font-medium block mb-3">Reference Image / Product Photo (optional)</label>
            {referencePreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-violet-500 mb-6">
                <img src={referencePreview} alt="Reference" className="w-full h-full object-cover" />
                <button onClick={() => { setReferencePreview(null); setReferenceImage(null); }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 rounded-full p-1 transition">
                  <X size={14} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-xs text-green-400">
                  Reference added
                </div>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center gap-3 hover:border-violet-500 transition text-gray-400 hover:text-white cursor-pointer mb-6">
                <Upload size={20} />
                Upload product photo or logo
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            {/* Brand Logo Upload */}
            <label className="font-medium block mb-3 mt-4">Brand Logo (optional — appears on video)</label>
            {logoPreview ? (
              <div className="relative w-full h-16 rounded-xl border border-green-500 flex items-center justify-center bg-[#060816] mb-4">
                <img src={logoPreview} alt="Logo" className="h-full object-contain p-2" />
                <button onClick={() => { setLogoPreview(null); setLogoUrl(null); }}
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-red-500">
                  <X size={12} />
                </button>
                <div className="absolute bottom-1 left-2 text-xs text-green-400">✓ Logo will appear on video</div>
              </div>
            ) : (
              <div onClick={() => logoInputRef.current?.click()}
                className="w-full h-14 border-2 border-dashed border-green-500/40 rounded-xl flex items-center justify-center gap-2 hover:border-green-500 transition text-gray-400 hover:text-white cursor-pointer mb-4 text-sm">
                <Upload size={16} className="text-green-400" />
                Upload brand logo
              </div>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

            {/* Text Overlay */}
            <div className="bg-[#060816] border border-white/10 rounded-2xl p-4 mb-4">
              <label className="font-medium block mb-3">✍️ Text on Video (optional)</label>
              <input type="text" value={overlayText} onChange={(e) => setOverlayText(e.target.value)}
                placeholder="e.g. Your tagline | Phone | Address"
                className="w-full bg-[#101522] border border-white/10 rounded-xl p-3 text-sm outline-none mb-3" />
              {overlayText && (
                <>
                  <select value={overlayFont} onChange={(e) => setOverlayFont(e.target.value)}
                    className="w-full bg-[#101522] border border-white/10 rounded-xl p-3 text-sm mb-3">
                    <optgroup label="Handwriting">
                      <option>Dancing Script</option><option>Caveat</option>
                      <option>Pacifico</option><option>Satisfy</option>
                      <option>Great Vibes</option><option>Indie Flower</option>
                    </optgroup>
                    <optgroup label="Elegant">
                      <option>Playfair Display</option><option>Cinzel</option>
                      <option>Tangerine</option><option>Cormorant Garamond</option>
                    </optgroup>
                    <optgroup label="Bold">
                      <option>Montserrat</option><option>Oswald</option>
                      <option>Bebas Neue</option><option>Anton</option>
                      <option>Raleway</option>
                    </optgroup>
                    <optgroup label="Professional">
                      <option>Roboto</option><option>Poppins</option>
                      <option>Open Sans</option><option>Lato</option>
                    </optgroup>
                    <optgroup label="Decorative">
                      <option>Lobster</option><option>Permanent Marker</option>
                      <option>Amatic SC</option><option>Fredoka One</option>
                    </optgroup>
                  </select>
                  <div className="flex gap-2 flex-wrap items-center">
                    {["#FFFFFF","#000000","#FFD700","#FF6B6B","#4ECDC4","#A855F7","#F97316"].map(c => (
                      <button key={c} onClick={() => setOverlayColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition ${overlayColor === c ? "border-white scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <input type="color" value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer" />
                  </div>
                </>
              )}
            </div>

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
                      {/* Per-scene text overlay */}
                      <div className="mt-3 border-t border-white/5 pt-3">
                        <input
                          type="text"
                          value={sceneTexts[i] || ""}
                          onChange={async (e) => {
                            const updated = [...sceneTexts];
                            updated[i] = e.target.value;
                            setSceneTexts(updated);
                            sceneTextsRef.current = updated;
                            localStorage.setItem('sceneTexts', JSON.stringify(updated));
                          }}
                          placeholder={`Text on Scene ${i + 1} (leave empty for no text)`}
                          className="w-full bg-[#101522] border border-white/10 rounded-lg p-2 text-xs outline-none text-gray-300"
                        />
                        {sceneTexts[i] && (
                          <div className="mt-2 flex gap-2 items-center flex-wrap">
                            <select
                              value={sceneFonts[i] || "Dancing Script"}
                              onChange={(e) => {
                                const updated = [...sceneFonts];
                                updated[i] = e.target.value;
                                setSceneFonts(updated);
                              }}
                              className="flex-1 bg-[#101522] border border-white/10 rounded-lg p-2 text-xs outline-none"
                            >
                              <option>Dancing Script</option>
                              <option>Caveat</option>
                              <option>Pacifico</option>
                              <option>Satisfy</option>
                              <option>Great Vibes</option>
                              <option>Indie Flower</option>
                              <option>Playfair Display</option>
                              <option>Cinzel</option>
                              <option>Tangerine</option>
                              <option>Montserrat</option>
                              <option>Oswald</option>
                              <option>Bebas Neue</option>
                              <option>Anton</option>
                              <option>Roboto</option>
                              <option>Poppins</option>
                              <option>Lobster</option>
                              <option>Permanent Marker</option>
                              <option>Amatic SC</option>
                            </select>
                            <div className="flex gap-1">
                              {["#FFFFFF","#000000","#FFD700","#FF6B6B","#A855F7","#F97316"].map(c => (
                                <button key={c}
                                  onClick={() => {
                                    const updated = [...sceneColors];
                                    updated[i] = c;
                                    setSceneColors(updated);
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 transition ${(sceneColors[i] || "#FFFFFF") === c ? "border-white scale-110" : "border-transparent"}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                              <input type="color"
                                value={sceneColors[i] || "#FFFFFF"}
                                onChange={(e) => {
                                  const updated = [...sceneColors];
                                  updated[i] = e.target.value;
                                  setSceneColors(updated);
                                }}
                                className="w-6 h-6 rounded-full cursor-pointer border-0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button onClick={generateImages} disabled={generatingImages || imagesReady}
                    className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 rounded-xl py-3 font-semibold flex items-center justify-center gap-2">
                    <Image size={16} />
                    {generatingImages ? "Generating..." : imagesReady ? "Images Ready" : "Generate Images"}
                  </button>

                  {imagesReady && (
                    <button onClick={applyOverlays} disabled={applyingOverlays}
                      className={`w-full rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition ${applyingOverlays ? "bg-yellow-700 cursor-not-allowed" : overlaysApplied ? "bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}>
                      <Sparkles size={16} />
                      {applyingOverlays ? "Applying..." : overlaysApplied ? "✓ Text & Logo Applied" : "Apply Text & Logo"}
                    </button>
                  )}

                  <button onClick={assembleVideo} disabled={!imagesReady || assemblingVideo || videoReady}
                    className="bg-[#060816] border border-white/10 disabled:opacity-40 rounded-xl py-3 font-semibold hover:border-violet-500 flex items-center justify-center gap-2">
                    <Layers size={16} />
                    {assemblingVideo ? "Assembling..." : videoReady ? "Assembled" : "Assemble Video"}
                  </button>

                  <button
                    onClick={() => navigate(`/preview?job_id=${jobId}`)}
                    disabled={!videoReady}
                    className={`text-center bg-[#060816] border border-white/10 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 ${!videoReady ? "opacity-40 pointer-events-none" : "hover:border-violet-500"}`}>
                    <Play size={16} /> Preview
                  </button>

                  <button
                    onClick={() => navigate(`/preview?job_id=${jobId}`)}
                    disabled={!videoReady}
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
