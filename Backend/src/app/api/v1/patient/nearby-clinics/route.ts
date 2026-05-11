// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patient/nearby-clinics
// Find clinics near a location
// Include doctors count and services
// Calculate distance
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';
import { calculateDistance } from '@/lib/oasis-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const specialty = searchParams.get('specialty') || undefined; // Filter by doctor specialty
    const serviceType = searchParams.get('service_type') || undefined; // Filter by service name

    if (!lat || !lng) {
      return apiError('lat y lng son requeridos', 422);
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Auth is optional
    const auth = await getAuthUserFromHeader(request);

    // Get all active clinics with coordinates
    const clinics = await db.clinic.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        _count: {
          select: {
            doctors: { where: { isActive: true } },
            services: { where: { isActive: true } },
          },
        },
        doctors: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        services: {
          where: { isActive: true },
          select: { id: true, name: true, price: true, duration: true },
        },
      },
    });

    // Calculate distance and filter by radius
    let nearbyClinics = clinics
      .map((clinic) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          clinic.latitude!,
          clinic.longitude!
        );

        // Filter doctors by specialty if provided
        const filteredDoctors = specialty
          ? clinic.doctors.filter((d) =>
              d.specialty.toLowerCase().includes(specialty.toLowerCase())
            )
          : clinic.doctors;

        // Filter services by type if provided
        const filteredServices = serviceType
          ? clinic.services.filter((s) =>
              s.name.toLowerCase().includes(serviceType.toLowerCase())
            )
          : clinic.services;

        return {
          id: clinic.id,
          name: clinic.name,
          description: clinic.description,
          address: clinic.address,
          city: clinic.city,
          department: clinic.department,
          phone: clinic.phone,
          email: clinic.email,
          website: clinic.website,
          logoUrl: clinic.logoUrl,
          latitude: clinic.latitude,
          longitude: clinic.longitude,
          distance: Math.round(distance * 10) / 10,
          doctorsCount: filteredDoctors.length,
          totalDoctors: clinic._count.doctors,
          servicesCount: filteredServices.length,
          totalServices: clinic._count.services,
          doctors: filteredDoctors.map((d) => ({
            id: d.id,
            name: d.user.name,
            specialty: d.specialty,
            consultationFee: d.consultationFee,
            rating: d.rating,
            avatarUrl: d.user.avatarUrl,
          })),
          services: filteredServices,
          settings: clinic.settings
            ? (() => {
                try { return JSON.parse(clinic.settings!); }
                catch { return null; }
              })()
            : null,
          telemedicineEnabled: clinic.settings
            ? (() => {
                try {
                  const settings = JSON.parse(clinic.settings!);
                  return settings?.telemedicine_enabled || false;
                } catch { return false; }
              })()
            : false,
        };
      })
      .filter((c) => {
        // Filter by radius
        if (c.distance > radius) return false;

        // If specialty filter, only show clinics with matching doctors
        if (specialty && c.doctorsCount === 0) return false;

        // If service filter, only show clinics with matching services
        if (serviceType && c.servicesCount === 0) return false;

        return true;
      })
      .sort((a, b) => a.distance - b.distance);

    // Apply pagination
    const total = nearbyClinics.length;
    const paginatedClinics = nearbyClinics.slice(
      (page - 1) * limit,
      page * limit
    );

    // Update patient location if authenticated
    if (auth?.user.role === 'patient') {
      const patient = await db.patient.findUnique({
        where: { userId: auth.user.id },
      });
      if (patient) {
        await db.patient.update({
          where: { id: patient.id },
          data: { latitude: userLat, longitude: userLng },
        });
      }
    }

    return apiSuccess({
      clinics: paginatedClinics,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
        radius,
        searchLocation: { latitude: userLat, longitude: userLng },
        filters: {
          specialty: specialty || null,
          serviceType: serviceType || null,
        },
      },
    });
  } catch (error) {
    console.error('Error finding nearby clinics:', error);
    return apiError('Error al buscar clínicas cercanas', 500);
  }
}
