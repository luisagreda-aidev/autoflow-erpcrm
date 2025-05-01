import { z } from "zod";

export const vehicleSchema = z.object({
  make: z.string().min(1, { message: "La marca es obligatoria." }),
  model: z.string().min(1, { message: "El modelo es obligatorio." }),
  year: z.number().int().min(1900, { message: "Año inválido." }).max(new Date().getFullYear() + 1, { message: "Año inválido." }), // Allow next year for future models
  vin: z.string().length(17, { message: "El VIN debe tener 17 caracteres." }).toUpperCase(),
  price: z.number().positive({ message: "El precio debe ser positivo." }),
  mileage: z.number().nonnegative({ message: "El kilometraje no puede ser negativo." }),
  status: z.enum(["En preparación", "Disponible", "Reservado", "Vendido", "Comprado"]),
  color: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.enum(["Manual", "Automática"]),
  features: z.string().optional(),
  condition: z.string().optional(),
  documentation: z.string().optional(),
  entryDate: z.date().default(new Date()), // Automatically set entry date
  cost: z.number().nonnegative({ message: "El coste no puede ser negativo." }).optional(),
  imageUrl: z.string().url({ message: "URL de imagen inválida." }).optional().or(z.literal('')), // Allow empty string or valid URL
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
```