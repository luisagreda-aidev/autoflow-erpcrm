// @/lib/reports.ts
'use server';

import { db } from './db'; // Import the database connection

// Define the structure for the report data
export interface VehicleReportData {
  totalVehicles: number;
  vehiclesByStatus: Record<string, number>;
  averagePrice: number | null;
  averageMileage: number | null;
  // Add more fields as needed, e.g., inventoryAgeStats, salesData, leadData
}

/**
 * Fetches and aggregates data required for the reports page.
 * @returns An object containing various report metrics.
 */
export async function getVehicleReportData(): Promise<VehicleReportData> {
  try {
    // Get total vehicle count
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM vehicles');
    const totalResult = totalStmt.get() as { count: number };
    const totalVehicles = totalResult?.count ?? 0;

    // Get count by status
    const statusStmt = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM vehicles
      GROUP BY status
    `);
    const statusResults = statusStmt.all() as { status: string; count: number }[];
    const vehiclesByStatus: Record<string, number> = {};
    statusResults.forEach(row => {
        // Normalize status names if necessary, e.g., lowercase
      vehiclesByStatus[row.status] = row.count;
    });

    // Get average price and mileage for 'Disponible' vehicles
    const avgStmt = db.prepare(`
      SELECT AVG(price) as avgPrice, AVG(mileage) as avgMileage
      FROM vehicles
      WHERE status = 'Disponible' OR status = 'Reservado' OR status = 'En preparación'
    `); // Adjust status filter as needed
    const avgResult = avgStmt.get() as { avgPrice: number | null; avgMileage: number | null };
    const averagePrice = avgResult?.avgPrice ?? null;
    const averageMileage = avgResult?.avgMileage ?? null;


    // --- Add more calculations here as needed ---
    // Example: Inventory Age (more complex, might involve date calculations)
    // Example: Sales velocity (requires sales data)
    // Example: Lead conversion rate (requires lead data)

    return {
      totalVehicles,
      vehiclesByStatus,
      averagePrice,
      averageMileage,
      // Add other calculated metrics
    };

  } catch (error) {
    console.error("Error generating vehicle report data:", error);
    throw new Error("No se pudieron generar los datos para los reportes de vehículos.");
  }
}

// Add functions for other report types (Leads, Sales) when data models exist
