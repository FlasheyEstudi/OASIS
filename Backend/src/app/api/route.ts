import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      name: "OASIS API",
      version: "1.0.0",
      description: "Tu Base de Salud — Plataforma de Salud Nicaragüense",
      status: "healthy",
      endpoints: 142,
      modules: 22
    }
  });
}