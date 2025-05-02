import { z } from "zod";

// Define max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Define allowed image types - including AVIF
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];


export const vehicleSchema = z.object({
  make: z.string().min(1, { message: "La marca es obligatoria." }),
  model: z.string().min(1, { message: "El modelo es obligatorio." }),
  year: z.number({required_error: "El año es obligatorio.", invalid_type_error: "Año inválido."}).int().min(1900, { message: "Año inválido." }).max(new Date().getFullYear() + 1, { message: "Año inválido." }),
  vin: z.string().length(17, { message: "El VIN debe tener 17 caracteres." }).toUpperCase(),
  price: z.number({required_error: "El precio es obligatorio.", invalid_type_error: "El precio debe ser un número."}).positive({ message: "El precio debe ser positivo." }),
  mileage: z.number({required_error: "El kilometraje es obligatorio.", invalid_type_error: "El kilometraje debe ser un número."}).nonnegative({ message: "El kilometraje no puede ser negativo." }),
  status: z.enum(["En preparación", "Disponible", "Reservado", "Vendido", "Comprado"]),
  color: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.enum(["Manual", "Automática"]),
  // Features are sent as comma-separated string in FormData, so validate as string then transform
  features: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
    z.array(z.string()).optional().default([])
  ),
  condition: z.string().optional(),
  documentation: z.string().optional(),
  entryDate: z.date({ coerce: true }), // Coerce string from FormData to Date
  cost: z.number().nonnegative({ message: "El coste no puede ser negativo." }).optional().nullable(), // Make cost optional and nullable
  imageUrl: z.string().url({ message: "URL de imagen inválida." }).optional().or(z.literal('')), // Keep for optional single URL

   // Validation for 'images' (File objects) on the client-side before FormData creation
   // On the server, files are handled separately from this Zod schema used for standard fields
   images: z.array(
     z.instanceof(File, { message: "Se esperaba un archivo." })
       .refine((file) => file.size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
       .refine(
         (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
         "Solo se aceptan .jpg, .jpeg, .png, .webp y .avif." // Added AVIF
       )
   ).optional().default([]), // Keep optional and default empty for the form state
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
