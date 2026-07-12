import api from "./api";

export interface GenerateImagePayload {
  prompt: string;
  negative_prompt: string;
  style: string;
  ratio: string;
  resolution: string;
  reference_image_url?: string;
  logo_url?: string;
  logo_position?: string;
  contact_text?: string;
  overlay_text?: string;
  overlay_font?: string;
  overlay_color?: string;
  client_id?: number;
}

export interface GeneratedImage {
  image_url: string;
  prompt: string;
  style: string;
  resolution: string;
}

export async function generateImage(payload: GenerateImagePayload): Promise<GeneratedImage> {
  const response = await api.post<GeneratedImage>("/api/v1/images/generate", payload);
  return response.data;
}
