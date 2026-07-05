import api from "./api";

export interface GenerateImagePayload {
  prompt: string;
  negative_prompt: string;
  style: string;
  ratio: string;
  resolution: string;
  reference_image_url?: string;
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
