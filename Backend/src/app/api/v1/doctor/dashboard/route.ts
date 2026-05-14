import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserFromHeader } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";
import { createAuditLog } from "@/lib/oasis-utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(req);
    if (!auth || auth.user.role !== "doctor") {
      return apiError("No autorizado", 401);
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: auth.user.id }
    });

    if (!doctor) return apiError("Médico no encontrado", 404);

    // Registro de auditoría
    await createAuditLog({
      userId: auth.user.id,
      action: 'view_dashboard',
      entity: 'Doctor',
      entityId: doctor.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      details: { section: 'dashboard' }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [appointments, patientCount, prescriptionCount] = await Promise.all([
      db.appointment.findMany({
        where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } },
        include: { patient: { include: { user: true } } },
        orderBy: { startTime: "asc" }
      }),
      db.doctorPatient.count({ where: { doctorId: doctor.id } }),
      db.prescription.count({ where: { doctorId: doctor.id } })
    ]);

    const stats = {
      todayAppointments: appointments,
      totalPatients: patientCount,
      totalPrescriptions: prescriptionCount,
      rating: doctor.rating,
      nextAppointment: appointments.find(a => a.status === "scheduled") || null
    };

    return apiSuccess(stats);
  } catch (error) {
    return handleError(error, "GET_DOCTOR_DASHBOARD");
  }
}
