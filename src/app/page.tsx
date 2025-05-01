// @/app/page.tsx
"use client"; // Add this directive

import * as React from "react"; // Import React
import { useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components
import { Label } from "@/components/ui/label"; // Import Label if needed for form
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export default function LeadsPage() {
  const leads: any[] = []; // Initialize as empty array
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false); // State for Add Lead dialog

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads y Clientes</h1>
        <div className="flex items-center gap-2">
           <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar leads..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filtrar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Nuevo</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Contactado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Seguimiento</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Perdido</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Convertido</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           {/* Add Lead Dialog */}
           <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
             <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Añadir Lead</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Lead</DialogTitle>
                  <DialogDescription>
                    Introduce la información del nuevo lead aquí. Haz clic en guardar cuando termines.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Placeholder Form Fields */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input id="name" placeholder="Nombre completo" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" placeholder="correo@ejemplo.com" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Teléfono
                    </Label>
                    <Input id="phone" type="tel" placeholder="+34 123 456 789" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">
                      Fuente
                    </Label>
                    <Input id="source" placeholder="Ej. Web, Referencia" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Lead</Button>
                   <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>

       <p className="text-muted-foreground">Gestiona tus leads y clientes potenciales.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <CardTitle>{lead.name}</CardTitle>
              <CardDescription>Fuente: {lead.source} - Asignado a: {lead.salesperson}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Estado: <span className={
                lead.status === 'Nuevo' ? 'text-info' :
                lead.status === 'Contactado' ? 'text-primary' :
                lead.status === 'Seguimiento' ? 'text-warning' : ''
              }>{lead.status}</span></p>
              <p className="text-sm text-muted-foreground">Recibido: {lead.date}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
               {/* Add Dialog for View Details */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>{lead.name}</DialogTitle>
                        <DialogDescription>
                            Información detallada del lead.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p><strong>Email:</strong> {lead.email || 'N/A'}</p>
                            <p><strong>Teléfono:</strong> {lead.phone || 'N/A'}</p>
                            <p><strong>Fuente:</strong> {lead.source}</p>
                            <p><strong>Asignado a:</strong> {lead.salesperson}</p>
                            <p><strong>Estado:</strong> {lead.status}</p>
                            <p><strong>Fecha Recibido:</strong> {lead.date}</p>
                            {/* Add more details as needed */}
                        </div>
                        <DialogFooter>
                         <DialogTrigger asChild>
                               <Button type="button" variant="secondary">
                                Cerrar
                               </Button>
                         </DialogTrigger>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
       {/* Placeholder for empty state */}
        {leads.length === 0 && (
          <Card className="col-span-full flex flex-col items-center justify-center py-10 border-dashed border-2">
            <CardHeader className="text-center">
              <CardTitle>No hay leads todavía</CardTitle>
              <CardDescription>Empieza añadiendo tu primer lead.</CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Lead
                        </Button>
                    </DialogTrigger>
                     {/* Re-use the same DialogContent structure as above */}
                     <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Añadir Nuevo Lead</DialogTitle>
                        <DialogDescription>
                            Introduce la información del nuevo lead aquí. Haz clic en guardar cuando termines.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                        {/* Placeholder Form Fields */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name-empty" className="text-right">
                            Nombre
                            </Label>
                            <Input id="name-empty" placeholder="Nombre completo" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email-empty" className="text-right">
                            Email
                            </Label>
                            <Input id="email-empty" type="email" placeholder="correo@ejemplo.com" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone-empty" className="text-right">
                            Teléfono
                            </Label>
                            <Input id="phone-empty" type="tel" placeholder="+34 123 456 789" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="source-empty" className="text-right">
                            Fuente
                            </Label>
                            <Input id="source-empty" placeholder="Ej. Web, Referencia" className="col-span-3" />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit">Guardar Lead</Button>
                        <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>Cancelar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
    