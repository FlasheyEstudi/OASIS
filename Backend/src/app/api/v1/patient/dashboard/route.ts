import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserFromHeader } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";
import { createAuditLog } from "@/lib/oasis-utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(req);
    if (!auth || auth.user.role !== "patient") {
      return apiError("No autorizado", 401);
    }

    const patient = await db.patient.findUnique({
      where: { userId: auth.user.id },
      include: {
        appointments: {
          where: { status: "scheduled", date: { gte: new Date() } },
          orderBy: { date: "asc" },
          take: 1,
          include: { doctor: { include: { user: true } } }
        },
        prescriptions: {
          where: { status: "active" },
          take: 5
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { pharmacy: true }
        }
      }
    });

    if (!patient) return apiError("Paciente no encontrado", 404);

    // Registro de auditoría
    await createAuditLog({
      userId: auth.user.id,
      action: 'view_dashboard',
      entity: 'Patient',
      entityId: patient.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      details: { section: 'dashboard' }
    });

    const stats = {
      nextAppointment: patient.appointments[0] || null,
      activePrescriptions: patient.prescriptions.length,
      activePrescriptionsList: patient.prescriptions.slice(0, 2), // Para el widget lateral
      loyaltyPoints: patient.loyaltyPoints,
      loyaltyLevel: patient.loyaltyLevel,
      recentOrders: patient.orders,
      activeOrders: await db.order.count({
        where: { patientId: patient.id, status: { notIn: ["delivered", "cancelled"] } }
      })
    };

    return apiSuccess(stats);
  } catch (error) {
    return handleError(error, "GET_PATIENT_DASHBOARD");
  }
}
