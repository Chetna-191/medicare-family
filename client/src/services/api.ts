import type {
  User,
  FamilyMember,
  Medicine,
  DailyScheduleResponse,
  AdherenceStatsResponse,
  DoseLog,
} from '../types';

const getApiBase = (): string => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  url = url.replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE = getApiBase();

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('medicare_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data.data !== undefined ? data.data : data;
    } catch (error: any) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- Family Members Endpoints ---
  async getMembers(): Promise<FamilyMember[]> {
    return this.request<FamilyMember[]>('/members');
  }

  async getMemberById(id: string): Promise<FamilyMember> {
    return this.request<FamilyMember>(`/members/${id}`);
  }

  async createMember(payload: {
    name: string;
    relation: string;
    age: number;
    avatarColor?: string;
  }): Promise<FamilyMember> {
    return this.request<FamilyMember>('/members', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMember(
    id: string,
    payload: { name?: string; relation?: string; age?: number; avatarColor?: string }
  ): Promise<FamilyMember> {
    return this.request<FamilyMember>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteMember(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Medicines Endpoints ---
  async getMedicines(memberId?: string): Promise<Medicine[]> {
    const query = memberId ? `?memberId=${memberId}` : '';
    return this.request<Medicine[]>(`/medicines${query}`);
  }

  async getMedicineById(id: string): Promise<Medicine> {
    return this.request<Medicine>(`/medicines/${id}`);
  }

  async createMedicine(payload: {
    memberId: string;
    name: string;
    dosage: string;
    instructions?: string;
    startDate: string;
    endDate?: string | null;
    timings: string[];
    colorTag?: string;
  }): Promise<Medicine> {
    return this.request<Medicine>('/medicines', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMedicine(
    id: string,
    payload: {
      name?: string;
      dosage?: string;
      instructions?: string;
      startDate?: string;
      endDate?: string | null;
      timings?: string[];
      colorTag?: string;
    }
  ): Promise<Medicine> {
    return this.request<Medicine>(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteMedicine(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/medicines/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Schedule Endpoints ---
  async getDailySchedule(date?: string): Promise<DailyScheduleResponse> {
    const query = date ? `?date=${date}` : '';
    return this.request<DailyScheduleResponse>(`/schedule${query}`);
  }

  async updateDoseStatus(payload: {
    medicineId: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'pending' | 'taken' | 'skipped' | 'missed';
  }): Promise<DoseLog> {
    return this.request<DoseLog>('/schedule/status', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Adherence Analytics Endpoints ---
  async getAdherenceStats(days: number = 7): Promise<AdherenceStatsResponse> {
    return this.request<AdherenceStatsResponse>(`/adherence?days=${days}`);
  }
}

export const api = new ApiService();
