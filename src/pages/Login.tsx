import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  try {
    setLoading(true);
console.log("Email:", email);
console.log("Password:", password);
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    navigate("/dashboard");

  } catch (error) {
    console.error("Login failed:", error);
    alert("Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#060816] flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#101522] border border-white/10 rounded-3xl p-10"
      >

        <h1 className="text-4xl font-bold text-white text-center">
          Wayne AI
        </h1>

        <p className="text-gray-400 text-center mt-3">
          AI Video Studio
        </p>

        <div className="mt-10">

          <label className="text-gray-300">
            Email
          </label>

          <div className="mt-2 flex items-center bg-[#060816] border border-white/10 rounded-xl px-4">

            <Mail className="text-gray-500" size={18} />

            <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="admin@wayne.ai"
              className="w-full bg-transparent outline-none p-4 text-white"
            />

          </div>

        </div>

        <div className="mt-6">

          <label className="text-gray-300">
            Password
          </label>

          <div className="mt-2 flex items-center bg-[#060816] border border-white/10 rounded-xl px-4">

            <Lock className="text-gray-500" size={18} />

           <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="********"
              className="w-full bg-transparent outline-none p-4 text-white"
            />

          </div>

        </div>

        <button
          onClick={handleLogin}
          className="mt-8 w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-xl text-white font-semibold flex justify-center items-center gap-3 transition"
        >

          <LogIn size={20} />

          {loading ? "Signing In..." : "Sign In"}

        </button>

        <p className="text-center text-gray-500 mt-8 text-sm">
          Powered by Wayne E Solutions
        </p>

      </motion.div>

    </div>
  );
}