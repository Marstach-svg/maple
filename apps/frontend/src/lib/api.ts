import type { ApiResponse } from '@maple/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new ApiError(data.error || 'Unknown error', response.status);
  }
  
  return data.data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    register: (email: string, password: string, name?: string) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    
    me: () => request('/auth/me'),
  },
  
  groups: {
    create: (name: string, description?: string) =>
      request('/groups', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      }),
    
    join: (inviteCode: string) =>
      request('/groups/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      }),
    
    list: () => request('/groups'),
    
    getStats: (groupId: string) =>
      request(`/groups/${groupId}/prefecture-stats`),
  },
  
  pins: {
    create: (groupId: string, pinData: any) =>
      request('/pins', {
        method: 'POST',
        headers: {
          'X-Group-Id': groupId,
        },
        body: JSON.stringify(pinData),
      }),
    
    list: (groupId: string) =>
      request(`/pins/group/${groupId}`),
    
    get: (pinId: string) =>
      request(`/pins/${pinId}`),
    
    update: (pinId: string, pinData: any) =>
      request(`/pins/${pinId}`, {
        method: 'PUT',
        body: JSON.stringify(pinData),
      }),
    
    delete: (pinId: string) =>
      request(`/pins/${pinId}`, { method: 'DELETE' }),
  },
};