import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Studio from "../pages/Studio";
import SmartVideo from "../pages/SmartVideo";
import ImageStudio from "../pages/ImageStudio";
import Quality from "../pages/Quality";
import Generating from "../pages/Generating";
import Preview from "../pages/Preview";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/smart-video" element={<SmartVideo />} />
        <Route path="/image-studio" element={<ImageStudio />} />
        <Route path="/quality" element={<Quality />} />
        <Route path="/generating" element={<Generating />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}