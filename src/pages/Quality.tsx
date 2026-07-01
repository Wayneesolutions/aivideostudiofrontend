import Layout from "../layouts/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Zap, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function Quality() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job_id");

  const qualities = [
    {
      title: "Low",
      resolution: "480p",
      speed: "~30 Seconds",
      description: "Fastest rendering for testing.",
      color: "bg-green-600",
      icon: <Zap size={34} />,
    },
    {
      title: "Medium",
      resolution: "720p",
      speed: "~1 Minute",
      description: "Best balance between speed and quality.",
      color: "bg-yellow-500",
      icon: <CheckCircle size={34} />,
      recommended: true,
    },
    {
      title: "High",
      resolution: "1080p",
      speed: "3–5 Minutes",
      description: "Highest quality for production videos.",
      color: "bg-violet-600",
      icon: <Rocket size={34} />,
    },
  ];

  const handleSelect = (quality: string) => {
    const params = new URLSearchParams();
    if (jobId) params.set("job_id", jobId);
    params.set("quality", quality);
    navigate(`/generating?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold">
          Select Video Quality
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Choose the rendering quality before generating your AI video.
        </p>

        <div className="grid grid-cols-3 gap-8 mt-12">

          {qualities.map((quality) => (
            <motion.div
              key={quality.title}
              whileHover={{ y: -8 }}
              className="bg-[#101522] border border-white/10 rounded-3xl p-8"
            >
              {quality.recommended && (
                <span className="bg-violet-600 px-4 py-2 rounded-full text-sm">
                  Recommended
                </span>
              )}

              <div className={`w-16 h-16 rounded-2xl ${quality.color} flex items-center justify-center mt-6`}>
                {quality.icon}
              </div>

              <h2 className="text-3xl font-bold mt-8">{quality.title}</h2>
              <h3 className="text-violet-400 mt-2">{quality.resolution}</h3>
              <p className="text-gray-400 mt-5">{quality.description}</p>
              <p className="mt-5">Rendering Time: {quality.speed}</p>

              <button
                onClick={() => handleSelect(quality.title.toLowerCase())}
                className="mt-10 w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-2xl font-semibold"
              >
                Select {quality.title}
              </button>
            </motion.div>
          ))}

        </div>
      </div>
    </Layout>
  );
}
