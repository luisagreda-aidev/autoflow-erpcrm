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
import fs from 'fs/promises'; // Use promises version of fs
import path from 'path';
import { ZodError } from 'zod';
import { vehicleSchema } from '@/lib/schemas/vehicle'; // Import schema for validation

// Define the upload directory relative to the public folder
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'vehicles');
const PUBLIC_URL_PREFIX = '/uploads/vehicles';


/**
 * Ensures the upload directory exists.
 */
async function ensureUploadDirExists() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ensured at: ${UPLOAD_DIR}`);
  } catch (error: any) {
    console.error('Error creating upload directory:', error);
    throw new Error('Could not create upload directory.');
  }
}

/**
 * Server Action to add a new vehicle, handling file uploads.
 * @param formData - The FormData object containing vehicle details and images.
 * @returns The id of the newly inserted vehicle.
 * @throws ZodError if validation fails, or Error for other issues.
 */
export async function addVehicle(formData: FormData): Promise<number> {
  console.log("[addVehicle Action] Received FormData");

  // 1. Extract and Validate Standard Fields using Zod
  const rawData = Object.fromEntries(formData.entries());
  const parsedData = {
    ...rawData,
    // Convert number fields from string
    year: rawData.year ? parseInt(rawData.year as string, 10) : undefined,
    price: rawData.price ? parseFloat(rawData.price as string) : undefined,
    mileage: rawData.mileage ? parseInt(rawData.mileage as string, 10) : undefined,
    cost: rawData.cost ? parseFloat(rawData.cost as string) : undefined,
    // Convert features from comma-separated string (if sent that way) or handle JSON
    features: typeof rawData.features === 'string' ? (rawData.features as string).split(',').map(f => f.trim()).filter(Boolean) : [],
    // Convert date string to Date object
    entryDate: rawData.entryDate ? new Date(rawData.entryDate as string) : new Date(),
    // Placeholder for images - validation happens separately/implicitly
    images: [], // We handle files separately
  };

   // Use Zod schema for basic field validation (excluding files here)
    const validationResult = vehicleSchema.safeParse(parsedData);

    if (!validationResult.success) {
        console.error("[addVehicle Action] Zod validation failed:", validationResult.error.flatten());
        // Throwing ZodError directly might expose too much detail.
        // Consider creating a custom error or simplifying the message.
        // For now, re-throw to see details during development.
        throw new ZodError(validationResult.error.issues);
        // Or throw a more generic error:
        // throw new Error("Validation failed. Please check the form fields.");
    }

    const validatedData = validationResult.data; // Data validated by Zod (excluding files)


  // 2. Handle File Uploads
  const imageFiles = formData.getAll('images') as File[]; // Get all files associated with 'images' key
  const uploadedImageUrls: string[] = [];

  console.log(`[addVehicle Action] Received ${imageFiles.length} image file(s).`);

  if (imageFiles.length > 0 && imageFiles[0].size > 0) { // Check if files were actually uploaded
    await ensureUploadDirExists(); // Ensure directory exists before saving

    for (const file of imageFiles) {
       // Basic server-side validation (complementary to client-side)
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
           console.error(`[addVehicle Action] File too large: ${file.name} (${file.size} bytes)`);
           throw new Error(`El archivo ${file.name} es demasiado grande (límite 5MB).`);
       }
       // Consider adding MIME type check here as well if needed

      // Generate unique filename (e.g., timestamp-originalname)
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = path.extname(file.name);
      const uniqueFilename = `${path.basename(file.name, extension)}-${uniqueSuffix}${extension}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFilename);
      const publicUrl = `${PUBLIC_URL_PREFIX}/${uniqueFilename}`; // Relative URL for DB

      console.log(`[addVehicle Action] Processing file: ${file.name} -> ${uniqueFilename}`);

      try {
        // Convert ArrayBuffer to Buffer and write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        uploadedImageUrls.push(publicUrl);
        console.log(`[addVehicle Action] Saved file to: ${filePath}`);
      } catch (error: any) {
        console.error(`[addVehicle Action] Error saving file ${file.name}:`, error);
        throw new Error(`Error al guardar la imagen ${file.name}.`);
      }
    }
  } else {
      console.log("[addVehicle Action] No image files found or files are empty.");
  }

  // 3. Prepare Data for Database (using validated data + file URLs)
   const vehicleDataForDb: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> = {
    make: validatedData.make,
    model: validatedData.model,
    year: validatedData.year,
    vin: validatedData.vin,
    price: validatedData.price,
    mileage: validatedData.mileage,
    status: validatedData.status,
    color: validatedData.color || null,
    engine: validatedData.engine || null,
    transmission: validatedData.transmission,
    features: JSON.stringify(validatedData.features || []), // Stringify features array
    condition: validatedData.condition || null,
    documentation: validatedData.documentation || null,
    entryDate: validatedData.entryDate.toISOString(),
    cost: validatedData.cost === undefined ? null : validatedData.cost, // Handle potential undefined cost
    // Use first uploaded image URL as primary, fallback to existing logic if needed
    imageUrl: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : (validatedData.imageUrl || null),
    images: JSON.stringify(uploadedImageUrls), // Store array of public URLs as JSON string
  };
   console.log("[addVehicle Action] Data prepared for DB:", { ...vehicleDataForDb, images: `${uploadedImageUrls.length} image URLs` });


  // 4. Insert into Database
  try {
    console.log("[addVehicle Action] Calling _addVehicleInternal...");
    const newId = _addVehicleInternal(vehicleDataForDb);
    console.log(`[addVehicle Action] Vehicle added with ID: ${newId}`);

    // 5. Revalidate Paths
    revalidatePath('/inventory'); // Revalidate the inventory page cache
    revalidatePath('/reports'); // Revalidate reports page cache
    console.log("[addVehicle Action] Revalidated paths: /inventory, /reports");

    return newId;
  } catch (error: any) {
    // Errors from _addVehicleInternal (like VIN constraint) are already specific
    console.error("[addVehicle Action] Error calling _addVehicleInternal:", error);
    // Propagate the error from the DB function or throw a generic one
    throw error; // Re-throw the specific error from DB layer
    // Or: throw new Error("Failed to save vehicle to database.");
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
    // TODO: Handle file uploads/deletions during update if required
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
    // TODO: Delete associated image files from the filesystem when deleting a vehicle
   try {
     // 1. Get vehicle details *before* deleting to know which files to remove
     const vehicleToDelete = await _getVehicleByIdInternal(id);
     const imagesToDelete = vehicleToDelete?.images ? JSON.parse(vehicleToDelete.images) : [];

     // 2. Delete the vehicle from the database
     const success = _deleteVehicleInternal(id);

     // 3. If DB deletion was successful, delete files
     if (success && imagesToDelete.length > 0) {
        console.log(`[deleteVehicle Action] Deleting images for vehicle ${id}:`, imagesToDelete);
        for (const imageUrl of imagesToDelete) {
            try {
                const filename = path.basename(imageUrl); // Extract filename from URL
                const filePath = path.join(UPLOAD_DIR, filename);
                await fs.unlink(filePath); // Delete file
                console.log(`[deleteVehicle Action] Deleted image file: ${filePath}`);
            } catch (fileError: any) {
                 // Log error but don't stop the process if a file is already gone
                 if (fileError.code === 'ENOENT') {
                     console.warn(`[deleteVehicle Action] Image file not found, skipping deletion: ${imageUrl}`);
                 } else {
                    console.error(`[deleteVehicle Action] Error deleting image file ${imageUrl}:`, fileError);
                    // Optional: Decide if failure to delete a file should cause the action to throw an error
                 }
            }
        }
     }

     // 4. Revalidate paths
     if (success) {
       revalidatePath('/inventory'); // Revalidate inventory page
       revalidatePath('/reports'); // Revalidate reports page
       console.log(`[deleteVehicle Action] Revalidated paths after deleting vehicle ${id}`);
     }
     return success;
   } catch (error: any) {
     console.error(`Server Action Error (deleteVehicle ${id}):`, error);
     throw new Error(error.message || "Failed to delete vehicle via server action.");
   }
}
