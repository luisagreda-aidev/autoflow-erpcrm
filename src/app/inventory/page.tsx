// @/app/inventory/page.tsx
"use client";

import * as React from "react";
import { useState, useRef, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PlusCircle, Search, Filter, X, ChevronDown, Calendar as CalendarIcon, Car, Upload, Trash2, Loader2, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import Alert Dialog
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { vehicleSchema, type VehicleInput } from "@/lib/schemas/vehicle";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// Import Server Actions instead of direct DB functions
import { addVehicle, getAllVehicles, deleteVehicle, type Vehicle as DbVehicle } from "@/lib/actions/vehicleActions"; // Added deleteVehicle

// Define Vehicle interface for frontend use, extending DbVehicle slightly
interface DisplayVehicle extends Omit<DbVehicle, 'features' | 'images'> {
  features: string[]; // Parsed features
  images: string[]; // Parsed image URLs (relative paths or full URLs based on server action)
  // Local state for managing file previews during upload
  localImagePreviews?: { file: File; preview: string }[];
}


// Expanded feature list
const allFeatures = [
  "Aire Acondicionado", "Climatizador Bizona", "Techo Solar", "Asientos de Cuero",
  "Asientos Calefactables", "Navegador GPS", "Pantalla Táctil", "Conectividad Bluetooth",
  "Apple CarPlay", "Android Auto", "Sensores de Aparcamiento (Delanteros)",
  "Sensores de Aparcamiento (Traseros)", "Cámara de Visión Trasera", "Cámara 360°",
  "Control de Crucero", "Control de Crucero Adaptativo", "Limitador de Velocidad",
  "Faros LED", "Faros Xenón", "Llantas de Aleación", "Arranque sin Llave",
  "Portón Trasero Eléctrico", "Sistema de Sonido Premium", "Head-Up Display",
  "Asistente de Mantenimiento de Carril", "Frenada de Emergencia Automática",
  "Detector de Ángulo Muerto", "Reconocimiento de Señales de Tráfico", "Bola de Remolque"
];


export default function InventoryPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<DisplayVehicle[]>([]);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DisplayVehicle | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; preview: string }[]>([]); // State for image previews during upload
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const [isPending, startTransition] = useTransition(); // For add/edit server action loading state
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading
  const [vehicleToDelete, setVehicleToDelete] = useState<DisplayVehicle | null>(null); // State for delete confirmation

  // Fetch initial vehicles on component mount using Server Action
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const dbVehicles = await getAllVehicles(); // Use Server Action
        const displayVehicles = dbVehicles.map(v => {
          let parsedImages: string[] = [];
          try {
             // Assuming images are stored as a JSON string array of relative URLs
             parsedImages = typeof v.images === 'string' ? JSON.parse(v.images || '[]') : [];
          } catch (e) {
            console.error(`Error parsing images JSON for vehicle ${v.id}:`, v.images, e);
            // Keep parsedImages as empty array on error
          }

          let parsedFeatures: string[] = [];
           try {
             parsedFeatures = typeof v.features === 'string' ? JSON.parse(v.features || '[]') : [];
           } catch (e) {
             console.error(`Error parsing features JSON for vehicle ${v.id}:`, v.features, e);
             // Keep parsedFeatures as empty array on error
           }


          return {
            ...v,
            features: parsedFeatures,
            images: parsedImages, // Parsed relative URLs
          };
        });
        setVehicles(displayVehicles);
      } catch (error: any) {
        console.error("Error fetching vehicles:", error); // Log the actual error
        toast({
          title: "Error al cargar vehículos",
          description: error.message || "No se pudieron obtener los datos del inventario.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, [toast]);

  // Debugging useEffect to show form errors in console
    useEffect(() => {
       if (form.formState.isSubmitSuccessful === false && Object.keys(form.formState.errors).length > 0) {
           console.error("Form Validation Errors:", form.formState.errors); // Log validation errors
           toast({
               title: "Errores de validación",
               description: "Por favor, revisa los campos marcados en rojo.",
               variant: "destructive",
            });
       }
    }, [form.formState.errors, form.formState.isSubmitSuccessful, toast]);


  // Initialize react-hook-form
  const form = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      year: undefined, // Use undefined for number fields to satisfy zod optional/required
      vin: "",
      price: undefined, // Default to undefined for zod number validation
      mileage: undefined, // Default to undefined for zod number validation
      status: "En preparación",
      color: "",
      engine: "",
      transmission: "Manual",
      features: [],
      condition: "",
      documentation: "",
      entryDate: new Date(),
      cost: undefined, // Make cost optional
      imageUrl: "",
      images: [], // Initialize images array (File objects for validation)
    },
  });




  // Clean up Object URLs on component unmount or when imagePreviews changes
  useEffect(() => {
    // This function will run when the component unmounts or before the effect runs again
    return () => {
      // Check if imagePreviews exists before iterating
      if (imagePreviews && imagePreviews.length > 0) {
          imagePreviews.forEach(image => URL.revokeObjectURL(image.preview));
          console.log("[Cleanup Effect] Revoked Object URLs for previews.");
      }
    };
  }, [imagePreviews]); // Dependency array ensures cleanup runs if previews change

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Disponible":
        return "bg-success text-success-foreground hover:bg-success/90";
      case "Reservado":
        return "bg-warning text-warning-foreground hover:bg-warning/90";
      case "Vendido":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "En preparación":
        return "bg-info text-info-foreground hover:bg-info/90";
      case "Comprado":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80"; // Use secondary bg directly
      default:
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80"; // Use secondary bg directly
    }
  };

 // Handle image selection
 const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentFiles = form.getValues('images') || []; // Get current File array from form state
      const newFiles = Array.from(files);

      // Filter out files that don't pass basic client-side validation (optional but good practice)
      const validNewFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Archivo Demasiado Grande",
            description: `"${file.name}" supera el límite de 5MB.`,
            variant: "destructive"
          });
          return false;
        }
        if (!vehicleSchema.shape.images.element.parse({})._def.schema._def.checks.find((check: any) => check.kind === 'refine' && check.message?.includes('Solo se aceptan'))?.check(file.type)) {
             toast({
                 title: "Tipo de Archivo No Válido",
                 description: `"${file.name}" tiene un formato no soportado.`,
                 variant: "destructive"
             });
             return false;
         }
        return true;
      });

      // Create new preview objects for newly selected *valid* files
      const newPreviews = validNewFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      // Combine existing files (from form state) and new *valid* files
      const updatedFiles = [...currentFiles, ...validNewFiles];

      // Combine existing previews (from local state) and new previews
      const updatedImagePreviewState = [...imagePreviews, ...newPreviews];

      setImagePreviews(updatedImagePreviewState); // Update local preview state
      form.setValue('images', updatedFiles, { shouldValidate: true }); // Update form with the combined File objects
      console.log(`[handleImageChange] Added ${validNewFiles.length} valid files. Total files in form: ${updatedFiles.length}`);

       // Clear the file input value to allow re-selecting the same file
       if (event.target) {
           event.target.value = "";
       }
    }
  };


  // Remove image preview and update form state
    const removeImage = (index: number) => {
        const imageToRemove = imagePreviews[index];
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        const updatedFiles = form.getValues('images')?.filter((_, i) => i !== index) || [];

        setImagePreviews(updatedPreviews);
        form.setValue('images', updatedFiles, { shouldValidate: true });

        // Clean up object URL only if imageToRemove exists
        if (imageToRemove) {
           URL.revokeObjectURL(imageToRemove.preview);
            console.log(`[removeImage] Revoked Object URL for preview ${index}.`);
        }


        // Reset file input if needed (optional, allows re-selecting the same file if removed)
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
         console.log(`[removeImage] Removed image at index ${index}. Total files in form: ${updatedFiles.length}`);
    };

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


 // Submit handler using server action with FormData
 const onSubmit = (data: VehicleInput) => {
    console.log("[onSubmit Vehicle] Form data validated by RHF:", data);

    // Create FormData object
    const formData = new FormData();

    // Append standard fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString()); // Send dates as ISO strings
        } else if (key === 'features' && Array.isArray(value)) {
            // Stringify the array for FormData
            formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      } else if (key === 'cost' && value === null) {
        // Omit or send empty string based on backend expectation for null cost
         formData.append(key, '');
      }
    });

    // Append image files (from RHF's validated data)
    if (data.images && data.images.length > 0) {
      data.images.forEach((file, index) => {
        formData.append('images', file, file.name); // Use the same key 'images' for all files
        console.log(`[onSubmit Vehicle] Appending file to FormData: ${file.name}`);
      });
    } else {
      console.log("[onSubmit Vehicle] No image files to append to FormData.");
    }

    console.log("[onSubmit Vehicle] FormData prepared. Keys:", Array.from(formData.keys()));
    // Don't log entire formData values due to potentially large file data

    startTransition(async () => {
      console.log("[onSubmit Vehicle] Starting transition...");
      try {
        console.log("[onSubmit Vehicle] Calling addVehicle server action with FormData...");
        // Call the Server Action with FormData
        const newVehicleId = await addVehicle(formData); // Pass FormData directly
        console.log("[onSubmit Vehicle] Server action returned new vehicle ID:", newVehicleId);

        // --- Verify ID before proceeding ---
        if (typeof newVehicleId !== 'number' || newVehicleId <= 0) {
          console.error("[onSubmit Vehicle] Invalid ID received from server action:", newVehicleId);
          throw new Error("Server action did not return a valid new vehicle ID.");
        }

        // --- Optimistic Update (using original validated data) ---
        // Derive optimistic URLs based on filenames (adjust if server changes names significantly)
        const optimisticImageUrls = (data.images || []).map(file => {
             // Simplified assumption - use a placeholder structure or refine based on actual server logic
             const uniqueSuffix = `temp-${Date.now()}`; // Placeholder for uniqueness
             const extension = file.name.split('.').pop();
             return `/uploads/vehicles/${file.name.split('.')[0]}-${uniqueSuffix}.${extension}`;
         });

        console.log("[onSubmit Vehicle] Generating optimistic image URLs:", optimisticImageUrls);

        const newDisplayVehicle: DisplayVehicle = {
          id: newVehicleId,
          make: data.make,
          model: data.model,
          year: Number(data.year),
          vin: data.vin,
          price: Number(data.price),
          mileage: Number(data.mileage),
          status: data.status,
          color: data.color || null,
          engine: data.engine || null,
          transmission: data.transmission,
          condition: data.condition || null,
          documentation: data.documentation || null,
          entryDate: data.entryDate.toISOString(),
          cost: data.cost === undefined ? null : Number(data.cost),
          imageUrl: optimisticImageUrls.length > 0 ? optimisticImageUrls[0] : (data.imageUrl || null),
          features: data.features || [],
          images: optimisticImageUrls,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setVehicles((prev) => [newDisplayVehicle, ...prev]);
        console.log("[onSubmit Vehicle] Optimistic update applied to state.");

        toast({
          title: "Vehículo Añadido",
          description: `${data.make} ${data.model} ha sido añadido al inventario.`,
          variant: "default",
        });
        setIsAddVehicleOpen(false);
        form.reset();
        console.log("[onSubmit Vehicle] Form reset.");

        // Clean up previews after successful submission
        try {
          if (imagePreviews && imagePreviews.length > 0) {
            imagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
            console.log("[onSubmit Vehicle] Object URLs revoked.");
          }
          setImagePreviews([]);
          console.log("[onSubmit Vehicle] Image previews state cleared.");
        } catch (revokeError) {
          console.error("[onSubmit Vehicle] Error revoking object URLs:", revokeError);
        }

        console.log("[onSubmit Vehicle] Submission process finished successfully.");

      } catch (error: any) {
        console.error("[onSubmit Vehicle] Error during vehicle submission process:", error);
        let description = "No se pudo guardar el vehículo.";
        if (error instanceof z.ZodError) {
          description = "Error de validación. Revisa los campos.";
          console.error("Zod Errors:", error.flatten());
        } else if (error.message.includes('VIN')) {
          description = `Error: El VIN ya existe.`;
        } else if (error.message.includes('constraint')) {
          description = `Error: Valor inválido proporcionado.`;
        } else if (error.message.includes('imagen')) {
          description = `Error al procesar una imagen: ${error.message}`;
        } else if (error.message) {
           description = error.message;
        }

        toast({
          title: "Error al añadir vehículo",
          description: description,
          variant: "destructive",
        });
        console.log("[onSubmit Vehicle] End transition with error.");
      }
    });
  };

  // Handle vehicle deletion
    const handleDeleteVehicle = async (id: number) => {
        setIsDeleting(true);
        try {
            const success = await deleteVehicle(id); // Call server action
            if (success) {
                setVehicles((prevVehicles) => prevVehicles.filter((vehicle) => vehicle.id !== id));
                toast({
                    title: "Vehículo Eliminado",
                    description: `El vehículo ha sido eliminado correctamente.`,
                    variant: "default",
                });
                setVehicleToDelete(null); // Close confirmation
                setIsDetailsOpen(false); // Close details modal if open
            } else {
                toast({
                    title: "Error al eliminar",
                    description: "No se pudo encontrar o eliminar el vehículo.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error(`Error deleting vehicle ${id}:`, error);
            toast({
                title: "Error al eliminar vehículo",
                description: error.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Open confirmation dialog
    const confirmDeleteVehicle = (vehicle: DisplayVehicle) => {
        setVehicleToDelete(vehicle);
    };


  const openDetailsModal = (vehicle: DisplayVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  }

  const renderVehicleForm = (formId: string) => (
     <Form {...form}>
       {/* IMPORTANT: Use a standard form element, RHF will handle preventDefault */}
      <form id={formId} className="grid gap-4 py-4">
        {/* Basic Info Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Toyota" {...field} disabled={isPending}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Corolla" {...field} disabled={isPending}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año *</FormLabel>
                <FormControl>
                    {/* Ensure field.value is treated as number for input */}
                    <Input
                        type="number"
                        placeholder="Ej. 2023"
                        {...field}
                        value={field.value ?? ''} // Handle potential undefined/null value
                        onChange={e => {
                            const val = e.target.value;
                            // Parse to number or keep as undefined if input is cleared or invalid
                            const num = parseInt(val, 10);
                            field.onChange(val === '' || isNaN(num) ? undefined : num);
                        }}
                         onBlur={field.onBlur} // RHF handles blur validation
                         disabled={isPending}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Basic Info Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>VIN *</FormLabel>
                    <FormControl>
                    <Input placeholder="Número de Bastidor (17 caract.)" {...field} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                    <Input placeholder="Ej. Rojo Metálico" {...field} value={field.value ?? ''} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kilometraje (km) *</FormLabel>
                         <FormControl>
                            <Input
                                type="number"
                                placeholder="Ej. 50000"
                                {...field}
                                value={field.value ?? ''} // Handle potential undefined/null
                                onChange={e => {
                                    const val = e.target.value;
                                    const num = parseInt(val, 10);
                                    // Allow empty string, otherwise parse
                                    field.onChange(val === '' || isNaN(num) || num < 0 ? undefined : num);
                                }}
                                onBlur={field.onBlur} // RHF handles blur validation
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
              />
          </div>

          {/* Technical Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engine"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Motor</FormLabel>
                    <FormControl>
                    <Input placeholder="Ej. 1.8L Híbrido" {...field} value={field.value ?? ''} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Transmisión *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona transmisión" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Automática">Automática</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          {/* Pricing & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Precio de Venta (€) *</FormLabel>
                     <FormControl>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Ej. 15000"
                            {...field}
                             value={field.value ?? ''} // Handle potential undefined/null
                            onChange={e => {
                                const val = e.target.value;
                                const num = parseFloat(val);
                                // Allow empty string, otherwise parse, ensure > 0
                                field.onChange(val === '' || isNaN(num) || num <= 0 ? undefined : num);
                            }}
                            onBlur={field.onBlur} // RHF handles blur validation
                            disabled={isPending}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Coste Adquisición (€)</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Ej. 12000"
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined from defaultValues or reset
                            onChange={e => {
                                const val = e.target.value;
                                const num = parseFloat(val);
                                // Allow empty string (treated as null/undefined by zod optional)
                                // Parse if not empty, ensure >= 0
                                field.onChange(val === '' || isNaN(num) || num < 0 ? undefined : num);
                            }}
                            onBlur={field.onBlur} // RHF handles blur validation
                             disabled={isPending}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="En preparación">En preparación</SelectItem>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                        <SelectItem value="Comprado">Comprado</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>

            {/* Entry Date */}
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Entrada *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                           disabled={isPending}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01") || isPending
                        }
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />


          {/* Features Field */}
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Características Destacadas</FormLabel>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between" disabled={isPending}>
                        <span>Seleccionar características ({field.value?.length || 0})</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    {/* Ensure DropdownMenuContent has sufficient z-index if needed */}
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto z-50"> {/* Increased z-index */}
                      <DropdownMenuLabel>Selecciona las características</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allFeatures.map((feature) => (
                        <DropdownMenuCheckboxItem
                          key={feature}
                          checked={field.value?.includes(feature)}
                          onCheckedChange={(checked) => {
                            // This logic should be fine
                            return checked
                              ? field.onChange([...(field.value || []), feature])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== feature
                                  )
                                );
                          }}
                           onSelect={(e) => e.preventDefault()} // Prevent closing on select
                           disabled={isPending}
                        >
                          {feature}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Display selected features */}
                   {field.value && field.value.length > 0 && (
                     <div className="mt-2 flex flex-wrap gap-1">
                       {field.value.map((feature) => (
                         <Badge key={feature} variant="secondary" className="text-xs">
                           {feature}
                           <button
                             type="button"
                             className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                             onClick={() => !isPending && field.onChange(field.value?.filter(f => f !== feature))}
                             disabled={isPending}
                           >
                             <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                           </button>
                         </Badge>
                       ))}
                     </div>
                   )}
                <FormMessage />
              </FormItem>
            )}
          />

            {/* Description Fields Row */}
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condición</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el estado general, posibles desperfectos, historial de mantenimiento..."
                      className="resize-y min-h-[60px]"
                      {...field}
                      value={field.value ?? ""} // Ensure value is not null/undefined
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documentación</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles sobre ITV, libro de mantenimiento, facturas, número de propietarios..."
                      className="resize-y min-h-[60px]"
                      {...field}
                      value={field.value ?? ""} // Ensure value is not null/undefined
                       disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Field */}
            <FormField
                  control={form.control}
                  name="images"
                  render={({ fieldState }) => ( // Use fieldState to get errors
                  <FormItem>
                      <FormLabel>Imágenes del Vehículo</FormLabel>
                      <FormControl>
                         {/* Hidden file input */}
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif" // Updated accept types
                          multiple
                          ref={fileInputRef}
                          className="hidden"
                           onChange={handleImageChange} // RHF doesn't manage file inputs directly, use custom handler
                           // We don't need {...field} for file inputs
                          disabled={isPending} // Disable during submission
                        />
                      </FormControl>
                       {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {imagePreviews.map((image, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <Image
                                            src={image.preview} // Use local blob URL for preview
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            className="object-cover rounded-md"
                                            sizes="(max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw" // Adjust sizes as needed
                                            // No need for onLoad revoke here, handled by useEffect
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={() => removeImage(index)}
                                            disabled={isPending} // Disable during submission
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        <Button type="button" variant="outline" onClick={triggerFileInput} className="mt-2" disabled={isPending}>
                            <Upload className="mr-2 h-4 w-4" /> Subir Imágenes
                        </Button>
                      <FormDescription>Sube una o varias imágenes del vehículo (máx. 5MB por imagen, .jpg, .png, .webp, .avif).</FormDescription>
                       {/* Manually display form-level errors for 'images' if needed, or rely on FormMessage below */}
                      <FormMessage /> {/* Displays validation errors for the images field */}
                  </FormItem>
                  )}
              />

            {/* Optional: Keep single image URL field if needed for fallback or primary image */}
            <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>URL de Imagen Principal (Opcional)</FormLabel>
                      <FormControl>
                      <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} value={field.value ?? ""} disabled={isPending}/>
                      </FormControl>
                      <FormDescription>Si no subes imágenes, puedes usar esta URL como imagen principal.</FormDescription>
                      <FormMessage />
                  </FormItem>
                  )}
              />
          {/* End of fields */}
        </form>
    </Form>
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold">Inventario de Vehículos</h1>
            <p className="text-muted-foreground mt-1">
                Gestiona todos los vehículos de tu concesionario.
            </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar (Marca, Modelo, VIN...)"
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 shrink-0">
                <Filter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filtrar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Disponible</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Reservado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Vendido</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>En preparación</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Comprado</DropdownMenuCheckboxItem>
              {/* Add more filters later */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- Add Vehicle Dialog Trigger --- */}
           <Dialog open={isAddVehicleOpen} onOpenChange={(open) => {
                setIsAddVehicleOpen(open);
                if (!open) {
                     // Clean up previews when closing dialog if not submitted
                     try {
                         if (imagePreviews && imagePreviews.length > 0) {
                            imagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
                             console.log("[Dialog Close] Revoked Object URLs.");
                         }
                     } catch (revokeError) {
                         console.error("[Dialog Close] Error revoking object URLs:", revokeError);
                     }
                    setImagePreviews([]);
                    form.reset(); // Reset form state
                    console.log("[Dialog Close] Add vehicle dialog closed, previews cleaned, form reset.");
                } else {
                     console.log("[Dialog Open] Add vehicle dialog opened.");
                }
            }}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1 shrink-0">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Añadir Vehículo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh]"> {/* Increased width */}
               <DialogHeader>
                 <DialogTitle>Añadir Nuevo Vehículo</DialogTitle>
                 <DialogDescription>
                    Introduce los detalles del vehículo. Los campos marcados con * son obligatorios.
                 </DialogDescription>
               </DialogHeader>
              <ScrollArea className="max-h-[calc(80vh-160px)] pr-6 -mr-6 pl-0.5">
                 {renderVehicleForm("add-vehicle-form")}
               </ScrollArea>
               <DialogFooter className="mt-4 pt-4 border-t">
                 <DialogClose asChild>
                    <Button variant="outline" disabled={isPending}>Cancelar</Button>
                 </DialogClose>
                 {/* Submit button triggers form submission via RHF's handleSubmit */}
                 <Button
                    type="button" // Change type to button to prevent default form submission
                    onClick={form.handleSubmit(onSubmit)} // Trigger RHF's submit handler
                    disabled={isPending}
                 >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Vehículo"
                    )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* --- End Add Vehicle Dialog --- */}

        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
          <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Cargando vehículos...</span>
          </div>
      )}


      {/* Vehicle Grid or Empty State */}
      {!isLoading && vehicles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0 relative aspect-[3/2] w-full"> {/* Make header relative */}
                 {/* Use first image from images array, then imageUrl, then placeholder */}
                 {/* IMPORTANT: Image URLs from filesystem are relative, prefix them */}
                 <Image
                    src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : (vehicle.imageUrl || 'https://picsum.photos/400/267?grayscale&blur=1')}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill // Use fill to cover the container
                    className="object-cover" // Ensure image covers the area
                    data-ai-hint={`${vehicle.make} ${vehicle.model} car dealership`}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Responsive sizes
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Check if the error source is already the placeholder to prevent infinite loops
                        if (target.src !== 'https://picsum.photos/400/267?grayscale&blur=1') {
                             target.src = 'https://picsum.photos/400/267?grayscale&blur=1';
                             target.alt = 'Placeholder Image';
                             console.warn(`Failed to load image: ${vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : vehicle.imageUrl}, falling back to placeholder.`);
                         }
                    }}
                    priority={false} // Consider setting priority based on position
                />
                 {vehicle.images && vehicle.images.length > 1 && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                      {vehicle.images.length} fotos
                    </Badge>
                  )}
              </CardHeader>
              <CardContent className="p-4 grid gap-1 flex-grow">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight truncate" title={`${vehicle.make} ${vehicle.model}`}>
                    {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <Badge
                    className={cn("text-xs shrink-0", getStatusBadgeVariant(vehicle.status))}
                  >
                    {vehicle.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {vehicle.year} - {vehicle.mileage.toLocaleString()} km
                </CardDescription>
                <p className="font-semibold text-lg mt-1">
                  {/* Ensure price is treated as number before formatting */}
                  {typeof vehicle.price === 'number' ? vehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : 'Precio no disponible'}
                </p>
                <p className="text-xs text-muted-foreground mt-auto pt-2 truncate" title={`VIN: ${vehicle.vin}`}>VIN: {vehicle.vin}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t mt-auto">
                <Button variant="outline" size="sm" onClick={() => openDetailsModal(vehicle)}>Ver Detalles</Button>
                 {/* Placeholder for Edit/Delete */}
                 {/* <Button variant="ghost" size="sm">Editar</Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : ( !isLoading && // Only show empty state if not loading
        // Empty State Card
        <Card className="col-span-full flex flex-col items-center justify-center py-16 border-dashed border-2 mt-8">
            <CardHeader className="text-center">
                <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" /> {/* Use Car icon */}
                <CardTitle className="text-xl">No hay vehículos en el inventario</CardTitle>
                <CardDescription>Empieza añadiendo tu primer vehículo.</CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isAddVehicleOpen} onOpenChange={(open) => {
                     setIsAddVehicleOpen(open);
                     if (!open) {
                          try {
                             if (imagePreviews && imagePreviews.length > 0) {
                               imagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
                                 console.log("[Dialog Close - Empty] Revoked Object URLs.");
                             }
                          } catch (revokeError) {
                              console.error("[Dialog Close - Empty] Error revoking object URLs:", revokeError);
                          }
                         setImagePreviews([]);
                         form.reset();
                         console.log("[Dialog Close - Empty] Add vehicle dialog closed, previews cleaned, form reset.");
                     } else {
                         console.log("[Dialog Open - Empty] Add vehicle dialog opened.");
                     }
                 }}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Vehículo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh]"> {/* Increased width */}
                         <DialogHeader>
                            <DialogTitle>Añadir Nuevo Vehículo</DialogTitle>
                            <DialogDescription>
                                Introduce los detalles del vehículo. Los campos marcados con * son obligatorios.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[calc(80vh-160px)] pr-6 -mr-6 pl-0.5">
                            {renderVehicleForm("add-vehicle-form-empty")}
                        </ScrollArea>
                        <DialogFooter className="mt-4 pt-4 border-t">
                           <DialogClose asChild>
                              <Button variant="outline" disabled={isPending}>Cancelar</Button>
                            </DialogClose>
                           {/* Submit button triggers form submission via RHF's handleSubmit */}
                            <Button
                                type="button" // Change type to button
                                onClick={form.handleSubmit(onSubmit)} // Trigger RHF submit
                                disabled={isPending}
                            >
                               {isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  "Guardar Vehículo"
                                )}
                           </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
             <DialogContent className="sm:max-w-4xl max-h-[90vh]"> {/* Increased width */}
                 {selectedVehicle && (
                     <>
                        <DialogHeader>
                         <DialogTitle>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</DialogTitle>
                         <DialogDescription>VIN: {selectedVehicle.vin}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[calc(80vh-180px)] pr-6 -mr-6 pl-0.5">
                         <div className="py-4 grid gap-4">
                            {/* Image Carousel/Grid */}
                            {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                    {selectedVehicle.images.map((imageUrl, index) => (
                                        <div key={index} className="relative aspect-[3/2] w-full rounded-md overflow-hidden">
                                            {/* IMPORTANT: Image URLs are relative, prefix if needed (handled by next/image automatically if under /public) */}
                                            <Image
                                                src={imageUrl} // Use the stored relative URL
                                                alt={`${selectedVehicle.make} ${selectedVehicle.model} - Foto ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                 sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                                                onError={(e) => {
                                                     const target = e.target as HTMLImageElement;
                                                     if (target.src !== 'https://picsum.photos/300/200?grayscale&blur=1') {
                                                         target.src = 'https://picsum.photos/300/200?grayscale&blur=1';
                                                         target.alt = 'Placeholder Image';
                                                         console.warn(`Failed to load detail image: ${imageUrl}, falling back to placeholder.`);
                                                     }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                             {/* Fallback if no uploaded images array but imageUrl exists */}
                             {(!selectedVehicle.images || selectedVehicle.images.length === 0) && selectedVehicle.imageUrl && (
                                <div className="relative aspect-[3/2] w-full mb-4 rounded-md overflow-hidden">
                                    <Image
                                        src={selectedVehicle.imageUrl}
                                        alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={`${selectedVehicle.make} ${selectedVehicle.model} detail view`}
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 500px"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src !== 'https://picsum.photos/600/400?grayscale&blur=1') {
                                                target.src = 'https://picsum.photos/600/400?grayscale&blur=1';
                                                target.alt = 'Placeholder Image';
                                                 console.warn(`Failed to load detail imageUrl: ${selectedVehicle.imageUrl}, falling back to placeholder.`);
                                            }
                                        }}
                                    />
                                </div>
                            )}


                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div><strong>Precio:</strong> {typeof selectedVehicle.price === 'number' ? selectedVehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : 'N/D'}</div>
                                <div><strong>Kilometraje:</strong> {typeof selectedVehicle.mileage === 'number' ? selectedVehicle.mileage.toLocaleString() : 'N/D'} km</div>
                                <div><strong>Color:</strong> {selectedVehicle.color || 'N/D'}</div>
                                <div><strong>Estado:</strong> <Badge className={cn("text-xs ml-1", getStatusBadgeVariant(selectedVehicle.status))}>{selectedVehicle.status}</Badge></div>
                                <div><strong>Motor:</strong> {selectedVehicle.engine || 'N/D'}</div>
                                <div><strong>Transmisión:</strong> {selectedVehicle.transmission}</div>
                                <div><strong>Coste:</strong> {selectedVehicle.cost ? selectedVehicle.cost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : 'N/D'}</div>
                                <div><strong>Entrada:</strong> {selectedVehicle.entryDate ? format(new Date(selectedVehicle.entryDate), "P", { locale: es }) : 'N/D'}</div>
                            </div>

                            {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="font-medium text-sm mb-2">Características:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedVehicle.features.map(feature => (
                                        <Badge key={feature} variant="secondary" className="text-xs font-normal">{feature}</Badge>
                                      ))}
                                    </div>
                                </div>
                            )}
                            {selectedVehicle.condition && (
                                <div className="mt-3">
                                    <h4 className="font-medium text-sm mb-1">Condición:</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedVehicle.condition}</p>
                                </div>
                            )}
                            {selectedVehicle.documentation && (
                                <div className="mt-3">
                                    <h4 className="font-medium text-sm mb-1">Documentación:</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedVehicle.documentation}</p>
                                </div>
                            )}
                         </div>
                       </ScrollArea>
                      <DialogFooter className="mt-4 pt-4 border-t flex justify-between items-center">
                         {/* Delete Button Trigger */}
                          <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => confirmDeleteVehicle(selectedVehicle)}
                             disabled={isDeleting}
                         >
                             {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                             <span className="ml-1">Eliminar Vehículo</span>
                         </Button>
                          {/* Edit Button Placeholder */}
                          {/* <Button variant="outline" size="sm">Editar</Button> */}
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">Cerrar</Button>
                          </DialogClose>
                      </DialogFooter>
                     </>
                 )}

             </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el vehículo <span className="font-semibold">{vehicleToDelete?.make} {vehicleToDelete?.model} (VIN: {vehicleToDelete?.vin})</span> y todas sus imágenes asociadas.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => vehicleToDelete && handleDeleteVehicle(vehicleToDelete.id)}
                    disabled={isDeleting}
                     className={cn(
                         "bg-destructive text-destructive-foreground hover:bg-destructive/90", // Destructive variant styling
                         isDeleting && "opacity-50 cursor-not-allowed"
                     )}
                >
                    {isDeleting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                    </>
                    ) : "Eliminar"}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
