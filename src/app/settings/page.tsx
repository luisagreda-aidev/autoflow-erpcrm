import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Ajustes</h1>
      <p className="text-muted-foreground">Configura las opciones de la aplicación.</p>

      <Card>
        <CardHeader>
          <CardTitle>Ajustes Generales</CardTitle>
          <CardDescription>Configuraciones básicas de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">[Aquí irían las opciones de configuración generales...]</p>
          {/* Example Setting */}
           <div className="mt-4 flex items-center justify-between border-t pt-4">
               <label htmlFor="currency" className="text-sm font-medium">Moneda</label>
               <select id="currency" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
               </select>
           </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Usuarios y Roles</CardTitle>
          <CardDescription>Gestiona los usuarios y sus permisos.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">[Aquí iría la gestión de usuarios...]</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Campos Personalizados</CardTitle>
          <CardDescription>Define campos adicionales para vehículos o leads.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">[Aquí iría la configuración de campos personalizados...]</p>
        </CardContent>
      </Card>

    </div>
  );
}
