import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio." }),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')), // Optional but must be valid if provided
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["Nuevo", "Contactado", "Seguimiento", "Perdido", "Convertido"]).default("Nuevo"),
  assignedTo: z.string().optional(), // Placeholder for salesperson assignment
  notes: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
