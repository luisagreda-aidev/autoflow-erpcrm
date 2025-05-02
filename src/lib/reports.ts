// @/lib/reports.ts
'use server'; // This module exports a Server Action

import { _getAllVehiclesInternal } from './db'; // Import internal DB function
// Import other internal functions as needed (e.g., for leads)

// Define the structure for the report data
export interface VehicleReportData {
  totalVehicles: number;
  vehiclesByStatus: Record<string, number>;
  averagePrice: number | null;
  averageMileage: number | null;
  // Add more fields as needed, e.g., inventoryAgeStats, salesData, leadData
}

/**
 * Server Action to fetch and aggregate data required for the reports page.
 * @returns An object containing various report metrics.
 */
export async function getVehicleReportData(): Promise<VehicleReportData> {
  try {
    // Get all vehicles using the internal function
    const vehicles = _getAllVehiclesInternal();

    const totalVehicles = vehicles.length;

    // Calculate count by status
    const vehiclesByStatus: Record<string, number> = {};
    vehicles.forEach(vehicle => {
      vehiclesByStatus[vehicle.status] = (vehiclesByStatus[vehicle.status] || 0) + 1;
    });

    // Calculate average price and mileage for relevant vehicles
    const relevantVehicles = vehicles.filter(v =>
        v.status === 'Disponible' || v.status === 'Reservado' || v.status === 'En preparación'
    );

    let sumPrice = 0;
    let sumMileage = 0;
    let countRelevant = relevantVehicles.length;

    relevantVehicles.forEach(v => {
        sumPrice += v.price;
        sumMileage += v.mileage;
    });

    const averagePrice = countRelevant > 0 ? sumPrice / countRelevant : null;
    const averageMileage = countRelevant > 0 ? sumMileage / countRelevant : null;


    // --- Add more calculations here as needed ---


    return {
      totalVehicles,
      vehiclesByStatus,
      averagePrice,
      averageMileage,
      // Add other calculated metrics
    };

  } catch (error) {
    console.error("Error generating vehicle report data:", error);
    // Consider logging the error or handling it differently
    // Re-throwing the original error might expose sensitive details.
    throw new Error("No se pudieron generar los datos para los reportes de vehículos.");
  }
}

// Add functions for other report types (Leads, Sales) when data models exist
