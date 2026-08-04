import { Habit, HabitCompletion } from './types';
import { getSessionToken } from './lib/cognito';

const API_BASE = '/api';

export class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function getHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res: Response, defaultErrorMsg: string) {
  if (!res.ok) {
    let errorMessage = defaultErrorMsg;
    try {
      const clonedRes = res.clone();
      const contentType = clonedRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await clonedRes.json();
        if (data && data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
        } else if (data && data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = JSON.stringify(data);
        }
      } else {
        const text = await clonedRes.text();
        if (text) errorMessage = text;
      }
    } catch (e) {
      // Keep default message if parsing fails
    }
    throw new ApiError(errorMessage, res.status);
  }
  return res;
}

export const api = {
  async getHabits(): Promise<Habit[]> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits`, { headers });
    await handleResponse(res, 'Failed to fetch habits');
    return res.json();
  },

  async createHabit(habitData: Partial<Habit>): Promise<Habit> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(habitData),
    });
    await handleResponse(res, 'Failed to create habit');
    return res.json();
  },

  async updateHabit(id: string, habitData: Partial<Habit>): Promise<Habit> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(habitData),
    });
    await handleResponse(res, 'Failed to update habit');
    return res.json();
  },

  async deleteHabit(id: string): Promise<void> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'DELETE',
      headers,
    });
    await handleResponse(res, 'Failed to delete habit');
  },

  async toggleCompletion(habitId: string, dateStr: string, completionData: HabitCompletion): Promise<void> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits/${habitId}/completions/${dateStr}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(completionData),
    });
    await handleResponse(res, 'Failed to toggle completion');
  },

  async batchCreateHabits(habits: Habit[]): Promise<void> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(habits),
    });
    await handleResponse(res, 'Failed to batch create habits');
  },

  async clearAll(): Promise<void> {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/habits/clear-all/confirm`, {
      method: 'DELETE',
      headers,
    });
    await handleResponse(res, 'Failed to clear data');
  }
};
