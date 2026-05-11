import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  const apiDir = path.join(process.cwd(), 'src/app/api');
  const routeFiles: string[] = [];
  const endpoints: { method: string; path: string; file: string }[] = [];

  // Walk all directories to find route.ts files
  async function walkDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
        await walkDir(fullPath);
      } else if (entry.name === 'route.ts') {
        routeFiles.push(fullPath);
      }
    }
  }

  try {
    await walkDir(apiDir);

    for (const file of routeFiles) {
      // Skip self-referential test route
      if (file.includes('test-all')) continue;
      const content = await readFile(file, 'utf-8');
      // Convert file path to API route
      let routePath = file.replace(apiDir, '/api').replace('/route.ts', '');
      // Normalize path separators
      routePath = routePath.replace(/\\/g, '/');

      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
      for (const method of methods) {
        const regex = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`);
        if (regex.test(content)) {
          endpoints.push({ method, path: routePath, file: file.replace(apiDir, '') });
        }
      }
    }

    // Test each endpoint
    const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    const testResults: { method: string; path: string; status: number; time: number; note: string }[] = [];

    // Login with test accounts to get tokens
    const tokens: Record<string, string> = {};
    const logins = [
      { role: 'patient', email: 'carlos@email.com', password: 'Patient2025!' },
      { role: 'superadmin', email: 'superadmin@oasis.nii', password: 'Oasis2025!' },
      { role: 'clinic_admin', email: 'admin@santamaria.nii', password: 'Clinic2025!' },
      { role: 'doctor', email: 'dr.garcia@santamaria.nii', password: 'Doctor2025!' },
      { role: 'receptionist', email: 'recepcion@santamaria.nii', password: 'Recep2025!' },
      { role: 'pharmacy_admin', email: 'admin@farmaciacentral.nii', password: 'Pharmacy2025!' },
      { role: 'delivery', email: 'repartidor1@oasis.nii', password: 'Delivery2025!' },
    ];

    for (const login of logins) {
      try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: login.email, password: login.password }),
        });
        const data = await res.json();
        if (data.data?.accessToken) tokens[login.role] = data.data.accessToken;
      } catch { /* skip */ }
    }

    // Test each endpoint
    for (const ep of endpoints) {
      const start = Date.now();
      let testUrl = ep.path;
      // Replace dynamic params with test values
      testUrl = testUrl.replace(/\[id\]/g, 'test-id');
      testUrl = testUrl.replace(/\[branchId\]/g, 'test-branch');
      testUrl = testUrl.replace(/\[orderId\]/g, 'test-order');
      testUrl = testUrl.replace(/\[memberId\]/g, 'test-member');

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        // Use superadmin token for auth endpoints, patient token as fallback
        const token = tokens['superadmin'] || tokens['patient'] || '';
        if (token && ep.method !== 'POST' || ep.path.includes('auth/')) {
          if (!ep.path.includes('/auth/login') && !ep.path.includes('/auth/register') && !ep.path.includes('/auth/forgot')) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const res = await fetch(`${baseUrl}${testUrl}`, {
          method: ep.method,
          headers,
          body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(ep.method) ? '{}' : undefined,
          signal: AbortSignal.timeout(8000),
        });

        const elapsed = Date.now() - start;
        let note = '';
        if (res.status >= 200 && res.status < 300) note = 'OK';
        else if (res.status === 401) note = 'Requiere auth';
        else if (res.status === 403) note = 'Prohibido (rol)';
        else if (res.status === 404) note = 'No encontrado (ID falso)';
        else if (res.status === 400) note = 'Bad request (body requerido)';
        else if (res.status === 422) note = 'Validacion';
        else if (res.status === 500) note = 'Error interno';
        else note = `Status ${res.status}`;

        testResults.push({ method: ep.method, path: ep.path, status: res.status, time: elapsed, note });
      } catch (err: unknown) {
        const elapsed = Date.now() - start;
        const msg = err instanceof Error ? err.message : String(err);
        testResults.push({ method: ep.method, path: ep.path, status: 0, time: elapsed, note: `Error: ${msg}` });
      }
    }

    // Summary
    const ok = testResults.filter(r => r.status >= 200 && r.status < 300).length;
    const auth = testResults.filter(r => r.status === 401 || r.status === 403).length;
    const clientErr = testResults.filter(r => r.status >= 400 && r.status < 500 && r.status !== 401 && r.status !== 403).length;
    const serverErr = testResults.filter(r => r.status >= 500).length;
    const noResponse = testResults.filter(r => r.status === 0).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalRoutes: routeFiles.length,
        totalEndpoints: endpoints.length,
        ok,
        auth,
        clientErrors: clientErr,
        serverErrors: serverErr,
        noResponse,
      },
      tokens: Object.keys(tokens).reduce((acc, k) => { acc[k] = tokens[k] ? 'OK' : 'FAILED'; return acc; }, {} as Record<string, string>),
      results: testResults,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
