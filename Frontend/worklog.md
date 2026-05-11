---
Task ID: 2
Agent: Main
Task: Fix demo login - add offline mode and role grouping in login page

Work Log:
- Fixed api-client.ts to safely parse JSON responses (handle HTML 404 from missing backend)
- Added safe text→JSON parsing for both main fetch and retry fetch
- Added offline demo mode to auth-store.ts with DEMO_USERS data for all 8 roles
- Added loginDemo() function that tries real API first, falls back to demo mode
- Added isDemoMode state to track when running in offline mode
- Updated initialize() to recognize demo tokens (demo_*) and restore demo sessions
- Updated LoginPage.tsx with grouped demo accounts by organization:
  - Sistema: Superadmin
  - Clínica Santa María: Admin Clínica + Recepcionista + Doctor (grouped together)
  - Farmacia Central: Admin Farmacia + Staff Farmacia (grouped together)
  - Personal: Paciente + Repartidor
- Added WifiOff icon notice: "Las demos funcionan en modo offline si la API no está disponible"

Stage Summary:
- Demo login now works in offline mode when backend API is not available
- Roles are visually grouped by organization (Clínica group, Farmacia group)
- JSON.parse error fixed by safe response parsing
- 0 lint errors, compilation successful

---
Task ID: 5
Agent: Main
Task: Complete API manual audit - review all backend endpoints, identify gaps, create bridge document

Work Log:
- Read complete API Manual (upload/API_MANUAL.md, 3803 lines) documenting 142 endpoints across 22 modules
- Read current Prisma schema (5 models: User, Clinic, Pharmacy, AuditLog, Post)
- Read current API route (only 1 endpoint: GET /api → "Hello, world!")
- Read api-client.ts and auth-store.ts to understand frontend connection layer
- Cataloged ALL 142 endpoints with HTTP method, path, auth requirements, and roles
- Cross-referenced user's expanded 123-endpoint proposal against existing API Manual
- Found that 53 of user's "new" endpoints already exist in the API Manual
- Identified 9 genuinely NEW endpoints needed (superadmin users, supplier CRUD details, promotion management)
- Identified critical gaps: missing DELETE for suppliers, missing superadmin user management, missing promotion update/delete
- Created comprehensive bridge document at OASIS_BACKEND_FRONTEND_BRIDGE.md

Stage Summary:
- **BACKEND IS NOT FUNCTIONAL**: 0 of 142 endpoints are implemented
- Current schema has 5 models, needs 36 (31 missing)
- Frontend runs in demo mode with hardcoded data
- Bridge document includes: full endpoint catalog, gap analysis, cross-reference, implementation plan, connection architecture, and AI prompt
- Total endpoints needed: 142 + 9 additional = 151
- Key finding: user's "new" endpoints were mostly already documented in the API Manual
