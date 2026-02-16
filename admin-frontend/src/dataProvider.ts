import { DataProvider, GetListParams, GetManyParams, Identifier, RaRecord } from 'react-admin';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
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

function withId(resource: string, row: any): any {
  if (resource === 'items') return { ...row, id: row.itemId };
  if (resource === 'monsters') return { ...row, id: row.monsterId };
  if (resource === 'companionMasters') return { ...row, id: row.companionId };
  if (resource === 'userCompanions') return { ...row, id: row.id };
  if (resource === 'monsterDrops') return { ...row, id: row.id };
  if (resource === 'waves') return { ...row, id: row.id };
  return { ...row, id: row.id ?? row.userId };
}

function paginate(rows: any[], params: GetListParams) {
  const page = params.pagination?.page ?? 1;
  const perPage = params.pagination?.perPage ?? 25;
  const start = (page - 1) * perPage;
  return {
    data: rows.slice(start, start + perPage),
    total: rows.length
  };
}

async function getListByResource(resource: string, params: GetListParams) {
  if (resource === 'players') {
    const rows = (await api<any[]>('/api/v1/admin/players')).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  if (resource === 'items') {
    const rows = (await api<any[]>('/api/v1/admin/items')).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  if (resource === 'monsters') {
    const rows = (await api<any[]>('/api/v1/admin/monsters')).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  if (resource === 'monsterDrops') {
    const monsterId = String(params.filter?.monsterId ?? 'slime-green');
    const rows = (await api<any[]>(`/api/v1/admin/monsters/${monsterId}/drops`)).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  if (resource === 'companionMasters') {
    const rows = (await api<any[]>('/api/v1/admin/companions/masters')).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  if (resource === 'userCompanions') {
    const userId = String(params.filter?.userId ?? '1');
    const rows = (await api<any[]>(`/api/v1/admin/companions/users/${userId}`)).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  if (resource === 'waves') {
    const dungeonId = String(params.filter?.dungeonId ?? 'dungeon1');
    const rows = (await api<any[]>(`/api/v1/admin/waves/${dungeonId}`)).map((r) => withId(resource, r));
    return paginate(rows, params);
  }
  throw new Error(`Unsupported resource: ${resource}`);
}

async function getManyByIds(resource: string, ids: readonly Identifier[]): Promise<RaRecord[]> {
  const list = await getListByResource(resource, {
    pagination: { page: 1, perPage: 9999 },
    sort: { field: 'id', order: 'ASC' },
    filter: {}
  });
  const idSet = new Set(ids.map(String));
  return list.data.filter((row) => idSet.has(String((row as any).id)));
}

const provider: any = {
  getList: (resource: string, params: any) => getListByResource(resource, params),
  getOne: async (resource: string, params: any) => {
    const rows = await getManyByIds(resource, [params.id]);
    if (!rows.length) throw new Error(`Record not found: ${resource}/${params.id}`);
    return { data: rows[0] };
  },
  getMany: async (resource: string, params: GetManyParams) => ({ data: await getManyByIds(resource, params.ids) }),
  getManyReference: async (resource: string, params: any) => getListByResource(resource, { ...params, filter: params.filter ?? {} }),

  create: async (resource: string, params: any) => {
    if (resource === 'items') {
      const created = withId(resource, await api<any>('/api/v1/admin/items', { method: 'POST', body: JSON.stringify(params.data) }));
      return { data: created };
    }
    if (resource === 'monsters') {
      const created = withId(resource, await api<any>('/api/v1/admin/monsters', { method: 'POST', body: JSON.stringify(params.data) }));
      return { data: created };
    }
    if (resource === 'monsterDrops') {
      const created = withId(resource, await api<any>('/api/v1/admin/monster-drops', { method: 'POST', body: JSON.stringify(params.data) }));
      return { data: created };
    }
    if (resource === 'waves') {
      const created = withId(resource, await api<any>('/api/v1/admin/waves', { method: 'POST', body: JSON.stringify(params.data) }));
      return { data: created };
    }
    if (resource === 'companionMasters') {
      const created = withId(resource, await api<any>('/api/v1/admin/companions/masters', { method: 'POST', body: JSON.stringify(params.data) }));
      return { data: created };
    }
    throw new Error(`Create not supported for ${resource}`);
  },

  update: async (resource: string, params: any) => {
    if (resource === 'players') {
      const updated = withId(resource, await api<any>(`/api/v1/admin/players/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) }));
      return { data: updated };
    }
    if (resource === 'items') {
      const updated = withId(resource, await api<any>(`/api/v1/admin/items/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) }));
      return { data: updated };
    }
    if (resource === 'monsters') {
      const updated = withId(resource, await api<any>(`/api/v1/admin/monsters/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) }));
      return { data: updated };
    }
    if (resource === 'monsterDrops') {
      const updated = withId(resource, await api<any>(`/api/v1/admin/monster-drops/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) }));
      return { data: updated };
    }
    if (resource === 'waves') {
      const updated = withId(resource, await api<any>(`/api/v1/admin/waves/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) }));
      return { data: updated };
    }
    if (resource === 'companionMasters') {
      const updated = withId(
        resource,
        await api<any>(`/api/v1/admin/companions/masters/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) })
      );
      return { data: updated };
    }
    if (resource === 'userCompanions') {
      const updated = withId(
        resource,
        await api<any>(`/api/v1/admin/companions/users/${params.id}`, { method: 'PUT', body: JSON.stringify(params.data) })
      );
      return { data: updated };
    }
    throw new Error(`Update not supported for ${resource}`);
  },

  updateMany: async () => ({ data: [] }),

  delete: async (resource: string, params: any) => {
    if (resource === 'players') {
      await api<void>(`/api/v1/admin/players/${params.id}`, { method: 'DELETE' });
      return { data: { id: params.id } as any };
    }
    if (resource === 'items') {
      await api<void>(`/api/v1/admin/items/${params.id}`, { method: 'DELETE' });
      return { data: { id: params.id } as any };
    }
    if (resource === 'monsters') {
      await api<void>(`/api/v1/admin/monsters/${params.id}`, { method: 'DELETE' });
      return { data: { id: params.id } as any };
    }
    if (resource === 'monsterDrops') {
      await api<void>(`/api/v1/admin/monster-drops/${params.id}`, { method: 'DELETE' });
      return { data: { id: params.id } as any };
    }
    if (resource === 'waves') {
      await api<void>(`/api/v1/admin/waves/${params.id}`, { method: 'DELETE' });
      return { data: { id: params.id } as any };
    }
    if (resource === 'companionMasters') {
      await api<void>(`/api/v1/admin/companions/masters/${params.id}`, { method: 'DELETE' });
      return { data: { id: params.id } as any };
    }
    throw new Error(`Delete not supported for ${resource}`);
  },

  deleteMany: async () => ({ data: [] })
};

export const dataProvider = provider as DataProvider;
