// @/app/page.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns"; // Import format
import { es } from "date-fns/locale"; // Import Spanish locale for date formatting
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Search, Filter, Loader2, UserRound, Mail, Phone, Info } from "lucide-react"; // Import necessary icons
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { leadSchema, type LeadInput } from "@/lib/schemas/lead"; // Import lead schema
import { useToast } from "@/hooks/use-toast";
// Import Server Actions instead of direct DB functions
import { addLead, getAllLeads, type Lead as DbLead } from "@/lib/actions/leadActions";

// Define DisplayLead interface for frontend use
interface DisplayLead extends DbLead {
  // Add any additional frontend-specific fields if needed
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<DisplayLead[]>([]);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition(); // For server action loading state

  // Initialize react-hook-form
  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: "",
      status: "Nuevo",
      assignedTo: "", // Add default if needed
      notes: "",
    },
  });

  // Fetch initial leads on component mount using Server Action
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const dbLeads = await getAllLeads(); // Use Server Action
        setLeads(dbLeads); // Directly set DB leads, no parsing needed for now
      } catch (error: any) {
         console.error("Error fetching leads:", error); // Log actual error
        toast({
          title: "Error al cargar leads",
          description: error.message || "No se pudieron obtener los datos de los leads.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, [toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Nuevo":
        return "bg-info text-info-foreground hover:bg-info/90";
      case "Contactado":
        return "bg-primary text-primary-foreground hover:bg-primary/90"; // Use primary or a specific color
      case "Seguimiento":
        return "bg-warning text-warning-foreground hover:bg-warning/90";
      case "Perdido":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
       case "Convertido":
        return "bg-success text-success-foreground hover:bg-success/90";
      default:
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    }
  };

  // Submit handler using server action
  const onSubmit = (data: LeadInput) => {
    startTransition(async () => {
      try {
        // Prepare data matching the expected type in the Server Action
        const leadDataForAction: Omit<DbLead, 'id' | 'createdAt' | 'updatedAt'> = {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          source: data.source || null,
          status: data.status,
          assignedTo: data.assignedTo || null,
          notes: data.notes || null,
        };

        // Call the Server Action
        const newLeadId = await addLead(leadDataForAction);

        // Optimistic Update using data prepared for the action
        const newDisplayLead: DisplayLead = {
          id: newLeadId,
          ...leadDataForAction,
          createdAt: new Date().toISOString(), // Add timestamp optimistically
          updatedAt: new Date().toISOString(),
        };
        setLeads((prev) => [newDisplayLead, ...prev]);

        toast({
          title: "Lead Añadido",
          description: `${data.name} ha sido añadido a la lista de leads.`,
          variant: "default",
        });
        setIsAddLeadOpen(false);
        form.reset();
      } catch (error: any) {
        console.error("Error adding lead:", error);
        toast({
          title: "Error al añadir lead",
          description: error.message || "No se pudo guardar el lead.",
          variant: "destructive",
        });
      }
    });
  };

  // Render Add/Edit Lead Form
   const renderLeadForm = (formId: string) => (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} disabled={isPending}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} value={field.value ?? ''} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                    <Input type="tel" placeholder="+34 123 456 789" {...field} value={field.value ?? ''} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Fuente</FormLabel>
                    <FormControl>
                    <Input placeholder="Ej. Web, Referencia, Llamada" {...field} value={field.value ?? ''} disabled={isPending}/>
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
                            <SelectItem value="Nuevo">Nuevo</SelectItem>
                            <SelectItem value="Contactado">Contactado</SelectItem>
                            <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                            <SelectItem value="Perdido">Perdido</SelectItem>
                            <SelectItem value="Convertido">Convertido</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
           <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Asignado a</FormLabel>
                    <FormControl>
                    {/* Replace with Select or Autocomplete for users later */}
                    <Input placeholder="Nombre del comercial" {...field} value={field.value ?? ''} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                     <Textarea
                        placeholder="Añade notas sobre el lead, interacciones, etc."
                        className="resize-y min-h-[80px]"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                     />
                    </FormControl>
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
            <h1 className="text-2xl font-semibold">Leads y Clientes</h1>
             <p className="text-muted-foreground mt-1">Gestiona tus leads y clientes potenciales.</p>
         </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar leads..."
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
              <DropdownMenuCheckboxItem checked>Nuevo</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Contactado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Seguimiento</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Perdido</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Convertido</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

           {/* --- Add Lead Dialog --- */}
           <Dialog open={isAddLeadOpen} onOpenChange={(open) => {
                setIsAddLeadOpen(open);
                if (!open) {
                    form.reset(); // Reset form on close
                }
            }}>
             <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1 shrink-0">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Añadir Lead</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg"> {/* Slightly wider modal */}
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Lead</DialogTitle>
                  <DialogDescription>
                    Introduce la información del nuevo lead. Los campos marcados con * son obligatorios.
                  </DialogDescription>
                </DialogHeader>
                  {renderLeadForm("add-lead-form")}
                <DialogFooter className="mt-4 pt-4 border-t">
                   <DialogClose asChild>
                    <Button variant="outline" disabled={isPending}>Cancelar</Button>
                   </DialogClose>
                  <Button type="submit" form="add-lead-form" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Lead"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* --- End Add Lead Dialog --- */}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
          <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Cargando leads...</span>
          </div>
      )}

      {/* Leads Grid or Empty State */}
       {!isLoading && leads.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                     <CardTitle className="text-base font-semibold leading-tight truncate" title={lead.name}>
                        {lead.name}
                     </CardTitle>
                     <Badge className={cn("text-xs shrink-0", getStatusBadgeVariant(lead.status))}>
                        {lead.status}
                     </Badge>
                  </div>
                   <CardDescription className="text-xs text-muted-foreground pt-1">
                       {lead.createdAt ? `Recibido: ${format(new Date(lead.createdAt), "P", { locale: es })}` : ''}
                       {lead.source ? ` - Fuente: ${lead.source}` : ''}
                   </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1.5 text-sm flex-grow">
                    {lead.email && (
                        <div className="flex items-center gap-2">
                             <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                             <span className="truncate" title={lead.email}>{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                         <div className="flex items-center gap-2">
                             <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate" title={lead.phone}>{lead.phone}</span>
                         </div>
                    )}
                    {lead.assignedTo && (
                        <div className="flex items-center gap-2">
                            <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Asignado a: {lead.assignedTo}</span>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t mt-auto">
                  {/* Add View/Edit Details Dialog Trigger */}
                  <Dialog>
                     <DialogTrigger asChild>
                         <Button variant="outline" size="sm">Ver Detalles</Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-lg">
                         <DialogHeader>
                             <DialogTitle>{lead.name}</DialogTitle>
                             <DialogDescription>
                                 <Badge className={cn("text-xs", getStatusBadgeVariant(lead.status))}>{lead.status}</Badge>
                                 {lead.createdAt ? ` - Recibido ${format(new Date(lead.createdAt), "Pp", { locale: es })}` : ''}
                             </DialogDescription>
                         </DialogHeader>
                         <div className="py-4 grid gap-3 text-sm">
                              <div><strong>Email:</strong> {lead.email || 'N/D'}</div>
                              <div><strong>Teléfono:</strong> {lead.phone || 'N/D'}</div>
                              <div><strong>Fuente:</strong> {lead.source || 'N/D'}</div>
                              <div><strong>Asignado a:</strong> {lead.assignedTo || 'N/D'}</div>
                              {lead.notes && (
                                 <div className="mt-2">
                                     <h4 className="font-medium mb-1">Notas:</h4>
                                     <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-2 rounded-md">{lead.notes}</p>
                                 </div>
                              )}
                         </div>
                         <DialogFooter className="mt-4 pt-4 border-t">
                            {/* Add Edit button here later */}
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cerrar</Button>
                            </DialogClose>
                         </DialogFooter>
                     </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
       ) : ( !isLoading && // Only show empty state if not loading
            <Card className="col-span-full flex flex-col items-center justify-center py-16 border-dashed border-2 mt-8">
                <CardHeader className="text-center">
                 <UserRound className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl">No hay leads todavía</CardTitle>
                <CardDescription>Empieza añadiendo tu primer lead.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isAddLeadOpen} onOpenChange={(open) => {
                        setIsAddLeadOpen(open);
                        if (!open) form.reset();
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Lead
                            </Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                            <DialogTitle>Añadir Nuevo Lead</DialogTitle>
                            <DialogDescription>
                                Introduce la información del nuevo lead. Los campos marcados con * son obligatorios.
                            </DialogDescription>
                            </DialogHeader>
                             {renderLeadForm("add-lead-form-empty")}
                            <DialogFooter className="mt-4 pt-4 border-t">
                             <DialogClose asChild>
                                <Button variant="outline" disabled={isPending}>Cancelar</Button>
                             </DialogClose>
                            <Button type="submit" form="add-lead-form-empty" disabled={isPending}>
                                {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                                ) : (
                                "Guardar Lead"
                                )}
                            </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        )}

    </div>
  );
}
