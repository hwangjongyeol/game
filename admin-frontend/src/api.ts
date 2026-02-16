export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
};

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.success || body.data == null) {
    throw new Error(body.error?.message ?? `Request failed: ${url}`);
  }
  return body.data;
}

export const adminApi = {
  getPlayers: () => call<any[]>('/api/v1/admin/players'),
  updatePlayer: (userId: number, payload: any) =>
    call<any>(`/api/v1/admin/players/${userId}`, { method: 'PUT', body: JSON.stringify(payload) }),

  getItems: () => call<any[]>('/api/v1/admin/items'),
  createItem: (payload: any) => call<any>('/api/v1/admin/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateItem: (itemId: string, payload: any) =>
    call<any>(`/api/v1/admin/items/${itemId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteItem: (itemId: string) => call<void>(`/api/v1/admin/items/${itemId}`, { method: 'DELETE' }),

  getMonsters: () => call<any[]>('/api/v1/admin/monsters'),
  createMonster: (payload: any) => call<any>('/api/v1/admin/monsters', { method: 'POST', body: JSON.stringify(payload) }),
  updateMonster: (monsterId: string, payload: any) =>
    call<any>(`/api/v1/admin/monsters/${monsterId}`, { method: 'PUT', body: JSON.stringify(payload) }),

  getDrops: (monsterId: string) => call<any[]>(`/api/v1/admin/monsters/${monsterId}/drops`),
  createDrop: (payload: any) => call<any>('/api/v1/admin/monster-drops', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDrop: (dropId: number) => call<void>(`/api/v1/admin/monster-drops/${dropId}`, { method: 'DELETE' }),

  getWaves: (dungeonId: string) => call<any[]>(`/api/v1/admin/waves/${dungeonId}`),
  createWave: (payload: any) => call<any>('/api/v1/admin/waves', { method: 'POST', body: JSON.stringify(payload) }),
  deleteWave: (waveId: number) => call<void>(`/api/v1/admin/waves/${waveId}`, { method: 'DELETE' })
};
