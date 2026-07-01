import api from "./api";

export interface Shot {
  idx: number;
  description: string;
  render_type: string;
  frame_url: string | null;
  clip_url: string | null;
  frame_status: string;
  clip_status: string;
}

export interface JobDetail {
  job_id: string;
  name: string;
  job_type: string;
  state: string;
  mode: string;
  est_cost: number;
  cost_total: number;
  final_urls: Record<string, string> | null;
  shots: Shot[];
  created_at: string;
  updated_at: string | null;
}

export interface Job {
  job_id: string;
  name: string;
  job_type: string;
  state: string;
  mode: string;
  est_cost: number;
  cost_total: number;
  created_at: string;
  updated_at: string | null;
}

export interface CreateJobPayload {
  client_id: number;
  name: string;
  brief_text: string;
  mode: string;
  job_type: string;
}

export interface CreateJobResponse {
  job_id: string;
  state: string;
  thread_id: string;
  message: string;
}

export async function listJobs(): Promise<Job[]> {
  const response = await api.get<{ total: number; items: Job[] }>("/api/v1/jobs/");
  return response.data.items;
}

export async function getJob(jobId: string): Promise<JobDetail> {
  const response = await api.get<JobDetail>(`/api/v1/jobs/${jobId}`);
  return response.data;
}

export async function createJob(payload: CreateJobPayload): Promise<CreateJobResponse> {
  const response = await api.post<CreateJobResponse>("/api/v1/jobs/", payload);
  return response.data;
}

export async function postMessage(jobId: string, message: string): Promise<void> {
  await api.post(`/api/v1/jobs/${jobId}/message`, { message });
}

export async function getFirstClientId(): Promise<number> {
  const response = await api.get<{ id: number }[]>("/api/v1/clients/");
  if (!response.data || response.data.length === 0) {
    throw new Error("No clients found. Please create a client first.");
  }
  return response.data[0].id;
}

// Poll a job until it reaches one of the target states (or FAILED).
export async function pollUntil(
  jobId: string,
  targetStates: string[],
  intervalMs = 1500,
  timeoutMs = 60000
): Promise<JobDetail> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const job = await getJob(jobId);
    if (targetStates.includes(job.state) || job.state === "FAILED") {
      return job;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Job timed out waiting for state: " + targetStates.join(", "));
}
