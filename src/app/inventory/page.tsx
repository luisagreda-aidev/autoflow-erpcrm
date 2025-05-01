import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Search, Filter } from "lucide-react";
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
import { cn } from "@/lib/utils"; // Ensure cn is imported

export default function InventoryPage() {
  // Removed hardcoded vehicles array
  const vehicles: any[] = []; // Initialize as empty array

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Disponible": return "bg-success text-success-foreground hover:bg-success/90";
      case "Reservado": return "bg-warning text-warning-foreground hover:bg-warning/90";
      case "Vendido": return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      default: return "secondary";
    }
  };

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventario de Vehículos</h1>
         <div className="flex items-center gap-2">
           <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar vehículos..."
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
              <DropdownMenuCheckboxItem checked>Disponible</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Reservado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Vendido</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>En preparación</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Comprado</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filtrar por Marca</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Add dynamic brands later */}
              <DropdownMenuCheckboxItem>Toyota</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Honda</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Ford</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>BMW</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-9 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Añadir Vehículo</span>
          </Button>
        </div>
      </div>
       <p className="text-muted-foreground">Gestiona todos los vehículos de tu concesionario.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
             <CardHeader className="p-0">
                <Image
                    src={vehicle.image}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    width={300}
                    height={200}
                    className="aspect-[3/2] w-full object-cover"
                    data-ai-hint={`${vehicle.make} ${vehicle.model}`}
                />
            </CardHeader>
            <CardContent className="p-4 grid gap-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                <Badge className={cn("text-xs", getStatusBadgeVariant(vehicle.status))} variant="secondary">
                  {vehicle.status}
                </Badge>
              </div>
              <CardDescription>{vehicle.year} - {vehicle.mileage.toLocaleString()} km</CardDescription>
              <p className="font-semibold text-lg">{vehicle.price.toLocaleString()} €</p>
               <p className="text-xs text-muted-foreground">VIN: {vehicle.vin}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-4 pt-0">
              <Button variant="outline" size="sm">Ver Detalles</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

       {/* Placeholder for empty state */}
        {vehicles.length === 0 && (
          <Card className="col-span-full flex flex-col items-center justify-center py-10 border-dashed border-2">
            <CardHeader className="text-center">
              <CardTitle>No hay vehículos en el inventario</CardTitle>
              <CardDescription>Empieza añadiendo tu primer vehículo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Vehículo
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
