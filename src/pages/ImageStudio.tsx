import { useState, useRef } from "react";
import Layout from "../layouts/Layout";
import {
  ImagePlus, Wand2, Download, ExternalLink, RefreshCw,
  Package, UtensilsCrossed, Car, Home, Smartphone, ShoppingBag,
  Sparkles, Upload, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { generateImage } from "../api/images";

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  timestamp: string;
}

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [ratio, setRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1024 × 1024");
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [overlayFont, setOverlayFont] = useState("Dancing Script");
  const [overlayColor, setOverlayColor] = useState("#FFFFFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Gallery — stores all generated images this session
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const currentImage = gallery[currentIdx] || null;

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setReferencePreview(dataUrl);
      setReferenceImageUrl(dataUrl);
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
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (prompt.trim() === "") { setError("Please enter a prompt before generating."); return; }
    setError(""); setLoading(true);
    try {
      const result = await generateImage({
        prompt,
        negative_prompt: negativePrompt,
        style,
        ratio,
        resolution: resolution.replace(" × ", "x"),
        reference_image_url: referenceImageUrl || undefined,
        logo_url: logoUrl || undefined,
        logo_position: logoUrl ? "top-right" : undefined,
        overlay_text: overlayText || undefined,
        overlay_font: overlayText ? overlayFont : undefined,
        overlay_color: overlayText ? overlayColor : undefined,
      });
      const newImage: GeneratedImage = {
        url: result.image_url,
        prompt: result.prompt,
        style: result.style,
        timestamp: new Date().toLocaleTimeString(),
      };
      setGallery(prev => {
        const updated = [...prev, newImage];
        setCurrentIdx(updated.length - 1);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally { setLoading(false); }
  };

  const templates = [
    { icon: Package, label: "Product Ad", text: "Create a premium product advertisement with cinematic lighting, clean background and professional commercial photography." },
    { icon: UtensilsCrossed, label: "Food Photo", text: "Professional food photography of a gourmet burger with cinematic lighting, realistic textures and shallow depth of field." },
    { icon: Car, label: "Luxury Car", text: "Luxury sports car on a mountain road during sunset with dramatic cinematic lighting." },
    { icon: Home, label: "Interior", text: "Modern luxury living room with elegant furniture, warm lighting and minimalist interior design." },
    { icon: Smartphone, label: "Social Media", text: "Instagram style promotional image with modern typography, vibrant colors and premium branding." },
    { icon: ShoppingBag, label: "Showcase", text: "Premium product showcase with studio lighting, luxury background and realistic reflections." },
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

            {/* Reference Image Upload */}
            <div className="mb-6">
              <label className="text-gray-300 font-medium block mb-3">
                Reference Image / Logo (optional)
              </label>
              {referencePreview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-violet-500">
                  <img src={referencePreview} alt="Reference" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setReferencePreview(null); setReferenceImageUrl(null); }}
                    className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-red-500/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center gap-3 hover:border-violet-500 transition text-gray-400 hover:text-white"
                >
                  <Upload size={20} />
                  Upload your product photo or logo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReferenceUpload}
              />
            </div>

            {/* Logo Upload */}
            <div className="mb-6">
              <label className="text-gray-300 font-medium block mb-3">
                Brand Logo (optional — GPT places it automatically)
              </label>
              {logoPreview ? (
                <div className="relative w-full h-20 rounded-xl border border-green-500 flex items-center justify-center bg-[#060816]">
                  <img src={logoPreview} alt="Logo" className="h-full object-contain p-2" />
                  <button onClick={() => { setLogoPreview(null); setLogoUrl(null); }}
                    className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-red-500/70">
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-1 left-2 text-xs text-green-400">
                    ✓ Logo will be placed intelligently by AI
                  </div>
                </div>
              ) : (
                <button onClick={() => logoInputRef.current?.click()}
                  className="w-full h-16 border-2 border-dashed border-green-500/40 rounded-xl flex items-center justify-center gap-3 hover:border-green-500 transition text-gray-400 hover:text-white">
                  <Upload size={18} className="text-green-400" />
                  Upload brand logo (PNG with transparency works best)
                </button>
              )}
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              
              {/* Contact Text removed — now using Text Overlay below */}
            </div>

            {/* Text Overlay Section */}
            <div className="mb-6 bg-[#060816] border border-white/10 rounded-2xl p-5">
              <label className="text-gray-300 font-medium block mb-3">✍️ Add Text on Image (optional)</label>
              <input type="text" value={overlayText} onChange={(e) => setOverlayText(e.target.value)}
                placeholder="e.g. Luxury Villas | Call: 628378332 | Pakhowal Road"
                className="w-full bg-[#101522] border border-white/10 rounded-xl p-3 text-sm outline-none mb-3" />
              {overlayText && (
                <>
                  <label className="text-gray-400 text-sm block mb-2">Font Style</label>
                  <select value={overlayFont} onChange={(e) => setOverlayFont(e.target.value)}
                    className="w-full bg-[#101522] border border-white/10 rounded-xl p-3 text-sm mb-3">
                    <optgroup label="Handwriting">
                      <option>Dancing Script</option><option>Caveat</option>
                      <option>Indie Flower</option><option>Kalam</option>
                      <option>Satisfy</option><option>Pacifico</option>
                      <option>Sacramento</option><option>Great Vibes</option>
                      <option>Allura</option><option>Pinyon Script</option>
                    </optgroup>
                    <optgroup label="Elegant Script">
                      <option>Playfair Display</option><option>Cormorant Garamond</option>
                      <option>Cinzel</option><option>Tangerine</option>
                      <option>EB Garamond</option><option>Libre Baskerville</option>
                    </optgroup>
                    <optgroup label="Bold Modern">
                      <option>Montserrat</option><option>Oswald</option>
                      <option>Raleway</option><option>Bebas Neue</option>
                      <option>Anton</option><option>Black Han Sans</option>
                    </optgroup>
                    <optgroup label="Clean Professional">
                      <option>Roboto</option><option>Open Sans</option>
                      <option>Lato</option><option>Poppins</option>
                      <option>Inter</option><option>Nunito</option>
                    </optgroup>
                    <optgroup label="Decorative">
                      <option>Lobster</option><option>Righteous</option>
                      <option>Permanent Marker</option><option>Amatic SC</option>
                      <option>Fredoka One</option><option>Alfa Slab One</option>
                    </optgroup>
                  </select>
                  <label className="text-gray-400 text-sm block mb-2">Text Color</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {["#FFFFFF","#000000","#FFD700","#FF6B6B","#4ECDC4","#A855F7","#F97316","#22C55E"].map(c => (
                      <button key={c} onClick={() => setOverlayColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition ${overlayColor === c ? "border-white scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <input type="color" value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer" title="Custom color" />
                  </div>
                  <p className="text-gray-500 text-xs mt-2">GPT will intelligently place and size the text on the image</p>
                </>
              )}
            </div>

            <label className="text-gray-300 font-medium">Prompt</label>
            <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-2xl p-4 outline-none resize-none" />

            <label className="text-gray-300 font-medium mt-6 block">Negative Prompt</label>
            <textarea rows={2} value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Things to avoid (optional)"
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-2xl p-4 outline-none resize-none" />

            <label className="text-gray-300 font-medium mt-6 block">Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-xl p-4">
              <option>Realistic</option><option>Product Photography</option>
              <option>Cinematic</option><option>Anime</option>
              <option>Cartoon</option><option>3D Render</option><option>Oil Painting</option>
            </select>

            <label className="text-gray-300 font-medium mt-6 block">Aspect Ratio</label>
            <select value={ratio} onChange={(e) => setRatio(e.target.value)}
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-xl p-4">
              <option value="1:1">1 : 1 (Square)</option>
              <option value="16:9">16 : 9 (Landscape)</option>
              <option value="9:16">9 : 16 (Portrait)</option>
              <option value="4:5">4 : 5 (Instagram)</option>
            </select>

            <label className="text-gray-300 font-medium mt-6 block">Resolution</label>
            <select value={resolution} onChange={(e) => setResolution(e.target.value)}
              className="mt-3 w-full bg-[#060816] border border-white/10 rounded-xl p-4">
              <option>1024 × 1024</option><option>1536 × 1536</option><option>2048 × 2048</option>
            </select>

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <button onClick={handleGenerate} disabled={loading}
              className={`mt-8 w-full py-4 rounded-2xl font-semibold flex justify-center items-center gap-3 transition ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"}`}>
              <Wand2 size={20} />
              {loading ? "Generating..." : "Generate Image"}
            </button>

            {/* Quick Templates */}
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

            {/* Image Details */}
            <div className="mt-8 bg-[#060816] rounded-2xl p-5 border border-white/10">
              <h2 className="text-xl font-semibold">Image Details</h2>
              <div className="mt-4 space-y-2 text-gray-300 text-sm">
                <p>Resolution: {resolution}</p>
                <p>Style: {style}</p>
                <p>Format: PNG</p>
                <p>Generated this session: {gallery.length}</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Preview + Gallery */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8 flex flex-col">

            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Wand2 size={60} className="mx-auto text-violet-400 animate-pulse" />
                  <p className="mt-4 text-gray-400">Generating your image...</p>
                </div>
              </div>
            )}

            {!loading && currentImage && (
              <>
                <img src={currentImage.url} alt="Generated"
                  className="w-full rounded-2xl object-cover max-h-[380px]" />

                <p className="text-gray-500 text-xs mt-2 text-center">
                  {currentImage.style} · {currentImage.timestamp} · "{currentImage.prompt.slice(0, 50)}..."
                </p>

                {/* Gallery navigation */}
                {gallery.length > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                      disabled={currentIdx === 0}
                      className="p-2 rounded-xl bg-[#060816] border border-white/10 disabled:opacity-30 hover:border-violet-500">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-gray-400 text-sm">{currentIdx + 1} / {gallery.length}</span>
                    <button onClick={() => setCurrentIdx(Math.min(gallery.length - 1, currentIdx + 1))}
                      disabled={currentIdx === gallery.length - 1}
                      className="p-2 rounded-xl bg-[#060816] border border-white/10 disabled:opacity-30 hover:border-violet-500">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <a href={currentImage.url} target="_blank" rel="noreferrer"
                    className="flex-1 bg-violet-600 hover:bg-violet-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                    <ExternalLink size={16} /> View Full
                  </a>
                  <a href={currentImage.url} download="generated-image.png"
                    className="flex-1 bg-[#060816] border border-white/10 hover:border-violet-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                    <Download size={16} /> Download
                  </a>
                </div>

                <button onClick={handleGenerate} disabled={loading}
                  className="mt-3 w-full bg-[#060816] border border-white/10 hover:border-violet-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                  <RefreshCw size={16} /> Regenerate
                </button>

                {/* Thumbnail gallery strip */}
                {gallery.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {gallery.map((img, i) => (
                      <button key={i} onClick={() => setCurrentIdx(i)}
                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === currentIdx ? "border-violet-500" : "border-transparent"}`}>
                        <img src={img.url} alt={`Gen ${i+1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {!loading && !currentImage && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ImagePlus size={80} className="mx-auto text-violet-400" />
                  <h2 className="text-2xl font-bold mt-6">Image Preview</h2>
                  <p className="text-gray-400 mt-2">Your generated image will appear here.</p>
                  <p className="text-gray-500 text-sm mt-2">Upload a reference photo to generate on-brand images</p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </Layout>
  );
}
