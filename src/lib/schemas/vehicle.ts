import { z } from "zod";

// Define max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Define allowed image types
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const vehicleSchema = z.object({
  make: z.string().min(1, { message: "La marca es obligatoria." }),
  model: z.string().min(1, { message: "El modelo es obligatorio." }),
  year: z.number().int().min(1900, { message: "Año inválido." }).max(new Date().getFullYear() + 1, { message: "Año inválido." }),
  vin: z.string().length(17, { message: "El VIN debe tener 17 caracteres." }).toUpperCase(),
  price: z.number().positive({ message: "El precio debe ser positivo." }),
  mileage: z.number().nonnegative({ message: "El kilometraje no puede ser negativo." }),
  status: z.enum(["En preparación", "Disponible", "Reservado", "Vendido", "Comprado"]),
  color: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.enum(["Manual", "Automática"]),
  features: z.array(z.string()).optional().default([]), // Keep features optional, default empty
  condition: z.string().optional(),
  documentation: z.string().optional(),
  entryDate: z.date().default(new Date()),
  cost: z.number().nonnegative({ message: "El coste no puede ser negativo." }).optional().nullable(), // Make cost optional and nullable
  imageUrl: z.string().url({ message: "URL de imagen inválida." }).optional().or(z.literal('')), // Keep for optional single URL

  // Update validation for multiple image uploads (File objects for client-side)
  images: z.array(
      z.instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          "Solo se aceptan .jpg, .jpeg, .png y .webp."
        )
    ).optional().default([]), // Make images optional and default to empty array for the form
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
```