import { test, expect, request as playwrightRequest } from '@playwright/test';

const asApi = async () => {
  const api = await playwrightRequest.newContext({
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      'x-user-id': process.env.E2E_AUTH_BYPASS_USER_ID || '00000000-0000-0000-0000-000000000000',
      'content-type': 'application/json'
    }
  });
  return api;
};

test.describe('E2E API CRUD', () => {
  test('categories: create, list, show, delete', async () => {
    const api = await asApi();

    const create = await api.post('/api/categories', { data: { name: `E2E Cat ${Date.now()}`, type: 'Expense' } });
    expect(create.ok()).toBeTruthy();
    const created = await create.json();
    const categoryId = created.data.id as number;
    expect(categoryId).toBeGreaterThan(0);

    const list = await api.get('/api/categories');
    expect(list.ok()).toBeTruthy();
    const categories = await list.json();
    expect(Array.isArray(categories)).toBeTruthy();

    const show = await api.get(`/api/categories/${categoryId}`);
    expect(show.ok()).toBeTruthy();
    const cat = await show.json();
    expect(cat.id).toBe(categoryId);

    const del = await api.delete(`/api/categories/${categoryId}`);
    expect(del.ok()).toBeTruthy();
  });

  test('months: create, list, show, update, delete', async () => {
    const api = await asApi();

    const monthPayload = { month: 1, year: 2099, notes: 'E2E' };
    const create = await api.post('/api/months', { data: monthPayload });
    expect(create.ok()).toBeTruthy();
    const created = await create.json();
    const monthId = created.data.id as number;

    const list = await api.get('/api/months');
    expect(list.ok()).toBeTruthy();

    const show = await api.get(`/api/months/${monthId}`);
    expect(show.ok()).toBeTruthy();

    const update = await api.put(`/api/months/${monthId}`, { data: { ...monthPayload, notes: 'E2E-updated' } });
    expect(update.ok()).toBeTruthy();

    const del = await api.delete(`/api/months/${monthId}`);
    expect(del.ok()).toBeTruthy();
  });

  test('transactions: create, list, show, update, delete', async () => {
    const api = await asApi();

    // Ensure prerequisites: category + month
    const catRes = await api.post('/api/categories', { data: { name: `E2E Tx Cat ${Date.now()}`, type: 'Expense' } });
    const catId = (await catRes.json()).data.id as number;
    const monthRes = await api.post('/api/months', { data: { month: 2, year: 2099 } });
    const monthId = (await monthRes.json()).data.id as number;

    const txPayload = {
      name: 'E2E Tx',
      amountCAD: 12.34,
      amountUSD: null,
      categoryId: catId,
      notes: 'note',
      type: 'Expense',
      date: new Date().toISOString(),
      monthId,
      clerkId: process.env.E2E_AUTH_BYPASS_USER_ID || '00000000-0000-0000-0000-000000000000'
    };

    const create = await api.post('/api/transactions', { data: txPayload });
    expect(create.status()).toBe(201);
    const created = await create.json();
    const txId = created.data.id as number;

    const list = await api.get(`/api/transactions?monthId=${monthId}`);
    expect(list.ok()).toBeTruthy();

    const show = await api.get(`/api/transactions/${txId}`);
    expect(show.ok()).toBeTruthy();

    const update = await api.put(`/api/transactions/${txId}`, { data: { name: 'E2E Tx Updated', amountCAD: 20.01 } });
    expect(update.ok()).toBeTruthy();

    const del = await api.delete(`/api/transactions/${txId}`);
    expect(del.ok()).toBeTruthy();

    // Cleanup
    await api.delete(`/api/categories/${catId}`);
    await api.delete(`/api/months/${monthId}`);
  });

  test('recurring transactions: create, list, show, update, delete', async () => {
    const api = await asApi();

    // prerequisite category
    const catRes = await api.post('/api/categories', { data: { name: `E2E Rec Cat ${Date.now()}`, type: 'Expense' } });
    const catId = (await catRes.json()).data.id as number;

    const payload = {
      name: 'E2E Rec',
      amountCAD: 9.99,
      amountUSD: null,
      categoryId: catId,
      notes: 'rec',
      dayOfMonth: 5,
      type: 'Expense'
    };

    const create = await api.post('/api/transactions/recurring', { data: payload });
    expect(create.status()).toBe(201);
    const created = await create.json();
    const recId = created.data.id as number;

    const list = await api.get('/api/transactions/recurring');
    expect(list.ok()).toBeTruthy();

    const show = await api.get(`/api/transactions/recurring/${recId}`);
    expect(show.ok()).toBeTruthy();

    const update = await api.put(`/api/transactions/recurring/${recId}`, { data: { notes: 'rec-updated' } });
    expect(update.ok()).toBeTruthy();

    const del = await api.delete(`/api/transactions/recurring/${recId}`);
    expect(del.ok()).toBeTruthy();

    await api.delete(`/api/categories/${catId}`);
  });
});


