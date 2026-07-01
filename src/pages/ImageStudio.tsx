import { useState } from "react";
import Layout from "../layouts/Layout";
import {
  ImagePlus, Wand2, Download, ExternalLink, RefreshCw,
  Package, UtensilsCrossed, Car, Home, Smartphone, ShoppingBag, Sparkles
} from "lucide-react";
import { generateImage } from "../api/images";

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [ratio, setRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1024 × 1024");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (prompt.trim() === "") { setError("Please enter a prompt before generating."); return; }
    setError(""); setLoading(true); setImageUrl(null);
    try {
      const result = await generateImage({ prompt, negative_prompt: negativePrompt, style, ratio, resolution: resolution.replace(" × ", "x") });
      setImageUrl(result.image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally { setLoading(false); }
  };

  const templates = [
    { icon: Package,        label: "Product Ad",    text: "Create a premium product advertisement with cinematic lighting, clean background and professional commercial photography." },
    { icon: UtensilsCrossed,label: "Food Photo",    text: "Professional food photography of a gourmet burger with cinematic lighting, realistic textures and shallow depth of field." },
    { icon: Car,            label: "Luxury Car",    text: "Luxury sports car on a mountain road during sunset with dramatic cinematic lighting." },
    { icon: Home,           label: "Interior",      text: "Modern luxury living room with elegant furniture, warm lighting and minimalist interior design." },
    { icon: Smartphone,     label: "Social Media",  text: "Instagram style promotional image with modern typography, vibrant colors and premium branding." },
    { icon: ShoppingBag,    label: "Showcase",      text: "Premium product showcase with studio lighting, luxury background and realistic reflections." },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold">AI Image Studio</h1>
        <p className="text-gray-400 mt-3">Generate professional AI images using advanced prompts.</p>

        <div className="grid grid-cols-2 gap-8 mt-10">

          {/* LEFT */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">
            <h2 className="text-2xl font-semibold mb-6">Image Settings</h2>

            <label className="text-gray-300 font-medium">Prompt</label>
            <textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-2xl p-4 outline-none resize-none" />

            <label className="text-gray-300 font-medium mt-8 block">Negative Prompt</label>
            <textarea rows={3} value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Things to avoid (optional)"
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-2xl p-4 outline-none resize-none" />

            <label className="text-gray-300 font-medium mt-8 block">Image Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-xl p-4">
              <option>Realistic</option><option>Product Photography</option>
              <option>Cinematic</option><option>Anime</option>
              <option>Cartoon</option><option>3D Render</option><option>Oil Painting</option>
            </select>

            <label className="text-gray-300 font-medium mt-8 block">Aspect Ratio</label>
            <select value={ratio} onChange={(e) => setRatio(e.target.value)}
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-xl p-4">
              <option value="1:1">1 : 1 (Square)</option>
              <option value="16:9">16 : 9 (Landscape)</option>
              <option value="9:16">9 : 16 (Portrait)</option>
              <option value="4:5">4 : 5 (Instagram)</option>
            </select>

            <label className="text-gray-300 font-medium mt-8 block">Resolution</label>
            <select value={resolution} onChange={(e) => setResolution(e.target.value)}
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-xl p-4">
              <option>1024 × 1024</option><option>1536 × 1536</option><option>2048 × 2048</option>
            </select>

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <button onClick={handleGenerate} disabled={loading}
              className={`mt-10 w-full py-4 rounded-2xl font-semibold flex justify-center items-center gap-3 transition ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"}`}>
              <Wand2 size={20} />
              {loading ? "Generating..." : "Generate Image"}
            </button>

            <div className="mt-8">
              <p className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" /> Quick Templates
              </p>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                  <button key={t.label} onClick={() => setPrompt(t.text)}
                    className="bg-[#060816] border border-white/10 rounded-xl p-3 hover:border-violet-500 transition flex items-center gap-2 text-sm">
                    <t.icon size={15} className="text-violet-400 shrink-0" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-5">Advanced Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3"><input type="checkbox" /> High Quality Rendering</label>
                <label className="flex items-center gap-3"><input type="checkbox" /> Face Enhancement</label>
                <label className="flex items-center gap-3"><input type="checkbox" /> Remove Background</label>
                <label className="flex items-center gap-3"><input type="checkbox" /> Watermark Free</label>
              </div>
            </div>

            <div className="mt-8 bg-[#060816] rounded-2xl p-5 border border-white/10">
              <h2 className="text-xl font-semibold">Image Details</h2>
              <div className="mt-4 space-y-2 text-gray-300">
                <p>Resolution : {resolution}</p>
                <p>Style : {style}</p>
                <p>Format : PNG</p>
                <p>Status : {imageUrl ? "Generated" : loading ? "Generating..." : "Ready"}</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Preview */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8 flex items-center justify-center">
            <div className="text-center w-full">

              {loading && (
                <div className="h-[350px] rounded-3xl bg-[#060816] border border-white/10 flex items-center justify-center">
                  <div>
                    <Wand2 size={60} className="mx-auto text-violet-400 animate-pulse" />
                    <p className="mt-4 text-gray-400">Generating your image...</p>
                  </div>
                </div>
              )}

              {imageUrl && !loading && (
                <>
                  <img src={imageUrl} alt="Generated" className="w-full rounded-3xl object-cover max-h-[450px]" />
                  <div className="flex gap-4 mt-6">
                    <a href={imageUrl} target="_blank" rel="noreferrer"
                      className="flex-1 bg-violet-600 hover:bg-violet-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                      <ExternalLink size={18} /> View Full
                    </a>
                    <a href={imageUrl} download="generated-image.jpg"
                      className="flex-1 bg-[#060816] border border-white/10 hover:border-violet-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                      <Download size={18} /> Download
                    </a>
                  </div>
                  <button onClick={handleGenerate}
                    className="mt-4 w-full bg-[#060816] border border-white/10 hover:border-violet-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                    <RefreshCw size={18} /> Regenerate
                  </button>
                </>
              )}

              {!imageUrl && !loading && (
                <>
                  <ImagePlus size={80} className="mx-auto text-violet-400" />
                  <h2 className="text-2xl font-bold mt-6">Image Preview</h2>
                  <p className="text-gray-400 mt-2">Your generated image will appear here.</p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
