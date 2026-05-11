// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/pharmacies/search
// Implementation following the Senior Architect specification
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { GET as nearbyHandler } from '@/app/api/patient/nearby-pharmacies/route';

/**
 * Proxy to nearby-pharmacies with specific parameter mapping if needed.
 * Fulfills the requirement: GET /api/pharmacies/search?lat=...&lng=...&medicationId=...&radius=...
 */
export async function GET(request: NextRequest) {
  // The logic is identical to nearby-pharmacies, so we reuse the handler
  return nearbyHandler(request);
}
