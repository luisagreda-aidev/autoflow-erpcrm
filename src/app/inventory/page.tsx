// @/app/inventory/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";
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
import { PlusCircle, Search, Filter, X, Check, ChevronDown, Calendar as CalendarIcon, Car } from "lucide-react"; // Import Car icon
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
import { vehicleSchema, type VehicleInput } from "@/lib/schemas/vehicle"; // Import the schema and type
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { format } from "date-fns";
import { es } from "date-fns/locale";


// Define Vehicle interface based on schema for frontend use
interface Vehicle extends VehicleInput {
  id: string; // Add an ID for mapping
  image: string; // Add image URL property
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
  const { toast } = useToast(); // Initialize toast
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // State for vehicles, typed
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Initialize react-hook-form
  const form = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(), // Default to current year
      vin: "",
      price: 0,
      mileage: 0,
      status: "En preparación", // Default status
      color: "",
      engine: "",
      transmission: "Manual", // Default transmission
      features: [], // Initialize as empty array
      condition: "",
      documentation: "",
      entryDate: new Date(),
      cost: 0,
      imageUrl: "", // Default to empty string
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Disponible":
        return "bg-success text-success-foreground hover:bg-success/90";
      case "Reservado":
        return "bg-warning text-warning-foreground hover:bg-warning/90";
      case "Vendido":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "En preparación":
        return "bg-info text-info-foreground hover:bg-info/90"; // Added info variant
      case "Comprado":
        return "secondary"; // Default secondary variant
      default:
        return "secondary";
    }
  };

  // Submit handler
  const onSubmit = (data: VehicleInput) => {
    console.log("New Vehicle Data:", data);
    // In a real app, you'd send this data to your backend API
    // For now, let's add it to the local state with a temporary ID and image
    const newVehicle: Vehicle = {
      ...data,
      id: `temp-${Date.now()}`, // Temporary ID
      image: data.imageUrl || 'https://picsum.photos/300/200?grayscale', // Use provided URL or default placeholder
      year: Number(data.year), // Ensure year is number
      price: Number(data.price), // Ensure price is number
      mileage: Number(data.mileage), // Ensure mileage is number
      cost: Number(data.cost), // Ensure cost is number
      features: data.features || [], // Ensure features is an array
    };
    setVehicles((prev) => [...prev, newVehicle]);
    toast({
      title: "Vehículo Añadido",
      description: `${data.make} ${data.model} ha sido añadido al inventario.`,
      variant: "default", // Explicitly set variant
    });
    setIsAddVehicleOpen(false); // Close the modal
    form.reset(); // Reset the form
  };

  const openDetailsModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  }

  const renderVehicleForm = (formId: string) => (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={formId} className="grid gap-4 py-4">
        {/* Basic Info Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Toyota" {...field} />
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
                  <Input placeholder="Ej. Corolla" {...field} />
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
                    <Input type="number" placeholder="Ej. 2023" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                    <Input placeholder="Número de Bastidor (17 caract.)" {...field} />
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
                    <Input placeholder="Ej. Rojo Metálico" {...field} />
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
                        <Input type="number" placeholder="Ej. 50000" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/>
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
                    <Input placeholder="Ej. 1.8L Híbrido" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input type="number" step="0.01" placeholder="Ej. 15000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                        <Input type="number" step="0.01" placeholder="Ej. 12000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          date > new Date() || date < new Date("1900-01-01")
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
                      <Button variant="outline" className="w-full justify-between">
                        <span>Seleccionar características ({field.value?.length || 0})</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
                      <DropdownMenuLabel>Selecciona las características</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allFeatures.map((feature) => (
                        <DropdownMenuCheckboxItem
                          key={feature}
                          checked={field.value?.includes(feature)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), feature])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== feature
                                  )
                                );
                          }}
                           onSelect={(e) => e.preventDefault()} // Prevent closing on select
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
                             onClick={() => field.onChange(field.value?.filter(f => f !== feature))}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Image URL Field */}
            <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>URL de la Imagen</FormLabel>
                      <FormControl>
                      <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormDescription>Opcional. Si no se proporciona, se usará una imagen de ejemplo genérica.</FormDescription>
                      <FormMessage />
                  </FormItem>
                  )}
              />
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
          <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1 shrink-0">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Añadir Vehículo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
               <DialogHeader>
                 <DialogTitle>Añadir Nuevo Vehículo</DialogTitle>
                 <DialogDescription>
                    Introduce los detalles del vehículo. Los campos marcados con * son obligatorios.
                 </DialogDescription>
               </DialogHeader>
              <ScrollArea className="max-h-[calc(80vh-160px)] pr-6 -mr-6 pl-0.5"> {/* Adjust height and padding */}
                 {renderVehicleForm("add-vehicle-form")}
               </ScrollArea>
               <DialogFooter className="mt-4 pt-4 border-t">
                 <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                 </DialogClose>
                {/* The onClick is handled by the form's onSubmit */}
                <Button type="submit" form="add-vehicle-form">Guardar Vehículo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* --- End Add Vehicle Dialog --- */}

        </div>
      </div>

      {/* Vehicle Grid */}
      {vehicles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0">
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  width={400} // Increased size
                  height={267} // Maintain 3:2 ratio
                  className="aspect-[3/2] w-full object-cover"
                  data-ai-hint={`${vehicle.make} ${vehicle.model}`}
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/400/267?grayscale';
                    (e.target as HTMLImageElement).alt = 'Placeholder Image';
                  }}
                  priority={false} // Only prioritize above-the-fold images if needed
                />
              </CardHeader>
              <CardContent className="p-4 grid gap-1 flex-grow">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight truncate" title={`${vehicle.make} ${vehicle.model}`}>
                    {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <Badge
                    className={cn("text-xs shrink-0", getStatusBadgeVariant(vehicle.status))}
                    variant={"default"} // Use default, color is handled by className
                  >
                    {vehicle.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {vehicle.year} - {vehicle.mileage.toLocaleString()} km
                </CardDescription>
                <p className="font-semibold text-lg mt-1">
                  {vehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-xs text-muted-foreground mt-auto pt-2">VIN: {vehicle.vin}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t mt-auto">
                 {/* View Details Button */}
                <Button variant="outline" size="sm" onClick={() => openDetailsModal(vehicle)}>Ver Detalles</Button>
                {/* Add Edit/Delete buttons here later */}
                {/* <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-1"/> Editar</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1"/> Eliminar</Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State Card
        <Card className="col-span-full flex flex-col items-center justify-center py-16 border-dashed border-2 mt-8">
            <CardHeader className="text-center">
                <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" /> {/* Replaced CarIcon with Car */}
                <CardTitle className="text-xl">No hay vehículos en el inventario</CardTitle>
                <CardDescription>Empieza añadiendo tu primer vehículo.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Re-use Add Vehicle Dialog Trigger */}
                <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Vehículo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh]">
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
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" form="add-vehicle-form-empty">Guardar Vehículo</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
             <DialogContent className="sm:max-w-2xl max-h-[90vh]">
                 {selectedVehicle && (
                     <>
                        <DialogHeader>
                         <DialogTitle>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</DialogTitle>
                         <DialogDescription>VIN: {selectedVehicle.vin}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[calc(80vh-180px)] pr-6 -mr-6 pl-0.5"> {/* Adjusted height */}
                         <div className="py-4 grid gap-4">
                            <div className="relative aspect-[3/2] w-full mb-4 rounded-md overflow-hidden">
                                <Image
                                    src={selectedVehicle.image}
                                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                                    fill // Use fill for responsive image size
                                    className="object-cover"
                                    data-ai-hint={`${selectedVehicle.make} ${selectedVehicle.model} detail view`}
                                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 500px" // Provide sizes for optimization
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      (e.target as HTMLImageElement).src = 'https://picsum.photos/600/400?grayscale';
                                      (e.target as HTMLImageElement).alt = 'Placeholder Image';
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div><strong>Precio:</strong> {selectedVehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                                <div><strong>Kilometraje:</strong> {selectedVehicle.mileage.toLocaleString()} km</div>
                                <div><strong>Color:</strong> {selectedVehicle.color || 'N/D'}</div>
                                <div><strong>Estado:</strong> <Badge className={cn("text-xs ml-1", getStatusBadgeVariant(selectedVehicle.status))} variant={"default"}>{selectedVehicle.status}</Badge></div>
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
                      <DialogFooter className="mt-4 pt-4 border-t">
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">Cerrar</Button>
                          </DialogClose>
                         {/* Add Edit/Delete buttons here later */}
                      </DialogFooter>
                     </>
                 )}

             </DialogContent>
        </Dialog>
    </div>
  );
}

// Helper function to ensure number parsing handles empty strings or invalid input gracefully
const parseNumber = (value: string | undefined | null): number | undefined => {
  if (value === null || value === undefined || value.trim() === "") {
    return undefined;
  }
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
};
