import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { handleError } from "@/lib/error-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Intentar buscar como Doctor
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, avatarUrl: true, biography: true } },
        clinic: true,
        appointments: {
          where: { status: "scheduled", date: { gte: new Date() } },
          take: 5
        }
      }
    });

    if (doctor) {
      return apiSuccess({ type: "doctor", ...doctor });
    }

    // Intentar buscar como Clínica
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        doctors: { include: { user: { select: { name: true, avatarUrl: true, specialty: true } } } },
        services: true,
        branches: true
      }
    });

    if (clinic) {
      return apiSuccess({ type: "clinic", ...clinic });
    }

    // Intentar buscar como Farmacia
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        inventoryBatches: {
          where: { isActive: true, quantity: { gt: 0 } },
          include: { medication: true },
          take: 10
        },
        branches: true
      }
    });

    if (pharmacy) {
      return apiSuccess({ type: "pharmacy", ...pharmacy });
    }

    return apiError("Perfil no encontrado", 404);
  } catch (error) {
    return handleError(error, "GET_PUBLIC_PROFILE");
  }
}
