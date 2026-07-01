import Layout from "../layouts/Layout";
import { useEffect, useState } from "react";
import {
  User,
  Palette,
  Key,
  Save,
  Bell,
  Moon,
  Monitor,
} from "lucide-react";
import { getSettings, saveSettings } from "../api/settings";
import type { SettingsData } from "../api/settings";

export default function Settings() {
  const [data, setData] = useState<SettingsData>({
    profile_name: "",
    profile_email: "",
    notifications_enabled: true,
    dark_mode: true,
    openai_api_key: "",
    vidu_api_key: "",
    elevenlabs_api_key: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setData)
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500 text-center py-20">Loading settings...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold">Settings</h1>

        <p className="text-gray-400 mt-3">
          Manage your Wayne AI Video Studio preferences.
        </p>

        <div className="grid grid-cols-2 gap-8 mt-10">

          {/* Profile */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <User />
              <h2 className="text-2xl font-semibold">Profile</h2>
            </div>
            <input
              placeholder="Full Name"
              value={data.profile_name}
              onChange={(e) => setData({ ...data, profile_name: e.target.value })}
              className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 mb-4 outline-none"
            />
            <input
              placeholder="Email"
              value={data.profile_email}
              onChange={(e) => setData({ ...data, profile_email: e.target.value })}
              className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 outline-none"
            />
          </div>

          {/* Appearance */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Palette />
              <h2 className="text-2xl font-semibold">Appearance</h2>
            </div>
            <div className="space-y-5">
              <button
                onClick={() => setData({ ...data, dark_mode: true })}
                className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 flex justify-between items-center"
              >
                <div className="flex gap-3 items-center"><Moon />Dark Theme</div>
                <span className={data.dark_mode ? "text-violet-400" : "text-gray-500"}>
                  {data.dark_mode ? "Active" : ""}
                </span>
              </button>
              <button
                onClick={() => setData({ ...data, dark_mode: false })}
                className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 flex justify-between items-center"
              >
                <div className="flex gap-3 items-center"><Monitor />System Theme</div>
                <span className={!data.dark_mode ? "text-violet-400" : "text-gray-500"}>
                  {!data.dark_mode ? "Active" : "Default"}
                </span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell />
              <h2 className="text-2xl font-semibold">Notifications</h2>
            </div>
            <div className="flex justify-between items-center">
              <span>Enable Notifications</span>
              <button
                onClick={() => setData({ ...data, notifications_enabled: !data.notifications_enabled })}
                className={`w-16 h-8 rounded-full transition ${data.notifications_enabled ? "bg-violet-600" : "bg-gray-600"}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full mt-1 transition ${data.notifications_enabled ? "ml-9" : "ml-1"}`} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-8">
              <span>Dark Mode</span>
              <button
                onClick={() => setData({ ...data, dark_mode: !data.dark_mode })}
                className={`w-16 h-8 rounded-full transition ${data.dark_mode ? "bg-violet-600" : "bg-gray-600"}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full mt-1 transition ${data.dark_mode ? "ml-9" : "ml-1"}`} />
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-[#101522] rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Key />
              <h2 className="text-2xl font-semibold">API Keys</h2>
            </div>
            <input
              placeholder="OpenAI API Key"
              value={data.openai_api_key}
              onChange={(e) => setData({ ...data, openai_api_key: e.target.value })}
              className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 mb-4 outline-none"
            />
            <input
              placeholder="Vidu API Key"
              value={data.vidu_api_key}
              onChange={(e) => setData({ ...data, vidu_api_key: e.target.value })}
              className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 mb-4 outline-none"
            />
            <input
              placeholder="ElevenLabs API Key"
              value={data.elevenlabs_api_key}
              onChange={(e) => setData({ ...data, elevenlabs_api_key: e.target.value })}
              className="w-full bg-[#060816] border border-white/10 rounded-xl p-4 outline-none"
            />
          </div>

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 px-8 py-4 rounded-2xl flex items-center gap-3 transition"
        >
          <Save />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>

      </div>
    </Layout>
  );
}
