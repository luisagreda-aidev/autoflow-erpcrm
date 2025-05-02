// @/lib/actions/vehicleActions.ts
'use server';

import {
  _addVehicleInternal,
  _getAllVehiclesInternal,
  _getVehicleByIdInternal,
  _updateVehicleInternal,
  _deleteVehicleInternal,
  type Vehicle
} from '@/lib/db'; // Import internal DB functions
import { revalidatePath } from 'next/cache'; // Import revalidatePath


/**
 * Server Action to add a new vehicle.
 * @param vehicleData - Object containing vehicle details.
 * @returns The id of the newly inserted vehicle.
 */
export async function addVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  try {
    const newId = _addVehicleInternal(vehicleData);
    revalidatePath('/inventory'); // Revalidate the inventory page cache
    revalidatePath('/reports'); // Revalidate reports page cache
    return newId;
  } catch (error: any) {
    console.error("Server Action Error (addVehicle):", error);
    // Rethrow the error or return a more user-friendly message
    throw new Error(error.message || "Failed to add vehicle via server action.");
  }
}

/**
 * Server Action to get all vehicles.
 * @returns An array of vehicle objects.
 */
export async function getAllVehicles(): Promise<Vehicle[]> {
    // No 'use server' needed here if only called server-side,
    // but adding it doesn't hurt and allows potential client calls if secured later.
   try {
     return _getAllVehiclesInternal();
   } catch (error: any) {
     console.error("Server Action Error (getAllVehicles):", error);
     throw new Error(error.message || "Failed to fetch vehicles via server action.");
   }
}

/**
 * Server Action to get a vehicle by ID.
 * @param id - The ID of the vehicle.
 * @returns The vehicle object or undefined.
 */
export async function getVehicleById(id: number): Promise<Vehicle | undefined> {
   try {
     return _getVehicleByIdInternal(id);
   } catch (error: any) {
     console.error(`Server Action Error (getVehicleById ${id}):`, error);
     throw new Error(error.message || "Failed to fetch vehicle by ID via server action.");
   }
}

/**
 * Server Action to update a vehicle.
 * @param id - The ID of the vehicle to update.
 * @param updates - An object containing the fields to update.
 * @returns true if successful, false otherwise.
 */
export async function updateVehicle(id: number, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
   try {
     const success = _updateVehicleInternal(id, updates);
     if (success) {
       revalidatePath('/inventory'); // Revalidate inventory page
       revalidatePath(`/inventory/${id}`); // Revalidate specific vehicle page if exists
       revalidatePath('/reports'); // Revalidate reports page
     }
     return success;
   } catch (error: any) {
     console.error(`Server Action Error (updateVehicle ${id}):`, error);
     throw new Error(error.message || "Failed to update vehicle via server action.");
   }
}

/**
 * Server Action to delete a vehicle.
 * @param id - The ID of the vehicle to delete.
 * @returns true if successful, false otherwise.
 */
export async function deleteVehicle(id: number): Promise<boolean> {
   try {
     const success = _deleteVehicleInternal(id);
     if (success) {
       revalidatePath('/inventory'); // Revalidate inventory page
       revalidatePath('/reports'); // Revalidate reports page
     }
     return success;
   } catch (error: any) {
     console.error(`Server Action Error (deleteVehicle ${id}):`, error);
     throw new Error(error.message || "Failed to delete vehicle via server action.");
   }
}
