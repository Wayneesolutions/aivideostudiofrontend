import api from "./api";

export interface SettingsData {
  profile_name: string;
  profile_email: string;
  notifications_enabled: boolean;
  dark_mode: boolean;
  openai_api_key: string;
  vidu_api_key: string;
  elevenlabs_api_key: string;
}

export async function getSettings(): Promise<SettingsData> {
  const response = await api.get<SettingsData>("/api/v1/settings/");
  return response.data;
}

export async function saveSettings(data: SettingsData): Promise<void> {
  // Save preferences (notifications, dark mode, API keys) to settings table
  await api.post("/api/v1/settings/", data);

  // Also update the real admin profile (name + email) in the admin table
  await api.put("/auth/profile", {
    full_name: data.profile_name,
    email: data.profile_email,
    current_password: "",
    new_password: "",
  });
}
