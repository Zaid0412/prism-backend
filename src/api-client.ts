// API Client utility for making authenticated requests to the Prism backend

export interface Solve {
  id: string;
  userId: string;
  time: number;
  scramble: string;
  puzzleType: string;
  state: 'none' | '+2' | 'DNF';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSolveData {
  time: number;
  scramble: string;
  puzzleType?: string;
  state?: 'none' | '+2' | 'DNF';
}

export interface UpdateSolveData {
  state: 'none' | '+2' | 'DNF';
}

export interface Stats {
  count: number;
  best: number | null;
  average5: number | null;
  average12: number | null;
  average100: number | null;
}

export interface SolvesFilters {
  puzzleType?: string;
  state?: string;
  sortBy?: 'date' | 'time';
  sortOrder?: 'asc' | 'desc';
}

class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;

  constructor(baseUrl: string, getToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      throw new Error((error as any).error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as T;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/api/health');
  }

  // Get solves
  async getSolves(filters?: SolvesFilters): Promise<Solve[]> {
    const params = new URLSearchParams();
    if (filters?.puzzleType) params.append('puzzleType', filters.puzzleType);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/api/solves${queryString ? `?${queryString}` : ''}`;

    return this.request<Solve[]>(endpoint);
  }

  // Create solve
  async createSolve(data: CreateSolveData): Promise<Solve> {
    return this.request<Solve>('/api/solves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update solve state
  async updateSolve(id: string, data: UpdateSolveData): Promise<Solve> {
    return this.request<Solve>(`/api/solves/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Delete solve
  async deleteSolve(id: string): Promise<void> {
    return this.request<void>(`/api/solves/${id}`, {
      method: 'DELETE',
    });
  }

  // Get stats
  async getStats(puzzleType?: string): Promise<Stats> {
    const params = new URLSearchParams();
    if (puzzleType) params.append('puzzleType', puzzleType);

    const queryString = params.toString();
    const endpoint = `/api/stats${queryString ? `?${queryString}` : ''}`;

    return this.request<Stats>(endpoint);
  }
}

export default ApiClient;
