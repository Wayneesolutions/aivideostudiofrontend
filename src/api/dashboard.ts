import api from "./api";

export interface RecentProject {
  id: string;
  name: string;
  status: string;
  date: string;
}

export interface DashboardStats {
  total_projects: number;
  videos_generated: number;
  ai_services_status: string;
  recent_projects: RecentProject[];
  recent_activity: {
    id: number;
    action: string;
    description: string;
    entity_type: string;
    created_at: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/api/v1/dashboard/stats");
  return response.data;
}
