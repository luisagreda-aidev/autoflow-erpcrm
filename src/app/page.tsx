import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, FileText, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export default function LeadsPage() {
  const leads = [
    { id: 1, name: "Juan Pérez", source: "Web", status: "Nuevo", date: "2024-07-28", salesperson: "Ana García" },
    { id: 2, name: "María López", source: "Teléfono", status: "Contactado", date: "2024-07-27", salesperson: "Carlos Ruiz" },
    { id: 3, name: "Carlos Gómez", source: "Visita", status: "Seguimiento", date: "2024-07-26", salesperson: "Ana García" },
    { id: 4, name: "Laura Fernández", source: "Web", status: "Nuevo", date: "2024-07-28", salesperson: "David Martín" },
  ];

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
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Nuevo</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Contactado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Seguimiento</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Perdido</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Convertido</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-9 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Añadir Lead</span>
          </Button>
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
              <Button variant="outline" size="sm">Ver Detalles</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       {/* Placeholder for empty state */}
        {leads.length === 0 && (
          <Card className="col-span-full flex flex-col items-center justify-center py-10">
            <CardHeader>
              <CardTitle>No hay leads todavía</CardTitle>
              <CardDescription>Empieza añadiendo tu primer lead.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Lead
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
