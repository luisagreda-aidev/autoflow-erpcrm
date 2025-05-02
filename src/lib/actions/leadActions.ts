// @/lib/actions/leadActions.ts
'use server';

import {
  _addLeadInternal,
  _getAllLeadsInternal,
  _deleteLeadInternal, // Import internal delete function
  // Import other internal lead functions (_getLeadByIdInternal, etc.) when implemented
  type Lead
} from '@/lib/db'; // Import internal DB functions
import { revalidatePath } from 'next/cache'; // Import revalidatePath

/**
 * Server Action to add a new lead.
 * @param leadData - Object containing lead details.
 * @returns The id of the newly inserted lead.
 */
export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  console.log("[addLead] Server Action called with data:", leadData); // ADDED
  try {
    const newId = _addLeadInternal(leadData);
    if (typeof newId !== 'number' || newId <= 0) {
        throw new Error("Database did not return a valid new ID.");
    }
    revalidatePath('/'); // Revalidate the leads page (root page) cache
    // Consider revalidating reports if they use lead data
    // revalidatePath('/reports');
    console.log("[addLead] Lead added successfully, ID:", newId);
    return newId;
  } catch (error: any) {
    console.error("Server Action Error (addLead):", error);
    // Rethrow the error or return a more user-friendly message
    throw new Error(error.message || "Failed to add lead via server action.");
  }
}

/**
 * Server Action to get all leads.
 * @returns An array of lead objects.
 */
export async function getAllLeads(): Promise<Lead[]> {
   try {
     return _getAllLeadsInternal();
   } catch (error: any) {
     console.error("Server Action Error (getAllLeads):", error);
     throw new Error(error.message || "Failed to fetch leads via server action.");
   }
}


/**
 * Server Action to delete a lead.
 * @param id - The ID of the lead to delete.
 * @returns true if successful, false otherwise.
 */
export async function deleteLead(id: number): Promise<boolean> {
   console.log(`[deleteLead] Server Action called for ID: ${id}`);
   try {
     const success = _deleteLeadInternal(id);
     if (success) {
       revalidatePath('/'); // Revalidate leads page
       // revalidatePath('/reports'); // Revalidate reports if needed
       console.log(`[deleteLead] Lead ${id} deleted successfully and path revalidated.`);
     } else {
        console.warn(`[deleteLead] Lead ${id} not found or deletion failed.`);
     }
     return success;
   } catch (error: any) {
     console.error(`Server Action Error (deleteLead ${id}):`, error);
     throw new Error(error.message || "Failed to delete lead via server action.");
   }
}



// Add other Server Actions for leads (getById, update) when the internal functions are implemented.
// Example:
// export async function getLeadById(id: number): Promise<Lead | undefined> {
//   try {
//     return _getLeadByIdInternal(id);
//   } catch (error: any) {
//     console.error(`Server Action Error (getLeadById ${id}):`, error);
//     throw new Error(error.message || "Failed to fetch lead by ID via server action.");
//   }
// }

// export async function updateLead(id: number, updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
//    try {
//      const success = _updateLeadInternal(id, updates);
//      if (success) {
//        revalidatePath('/'); // Revalidate leads page
//        // revalidatePath(`/leads/${id}`); // Revalidate specific lead page if exists
//        // revalidatePath('/reports');
//      }
//      return success;
//    } catch (error: any) {
//      console.error(`Server Action Error (updateLead ${id}):`, error);
//      throw new Error(error.message || "Failed to update lead via server action.");
//    }
// }
