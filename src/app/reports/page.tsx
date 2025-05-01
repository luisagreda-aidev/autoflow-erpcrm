import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Car, Activity } from "lucide-react";

export default function ReportsPage() {
  const reportTypes = [
    { title: "Ventas", description: "Análisis de ventas por periodo, vendedor, marca/modelo.", icon: BarChart3 },
    { title: "Inventario", description: "Antigüedad, rotación, vehículos populares.", icon: Car },
    { title: "Leads", description: "Rendimiento de leads, conversión, fuentes.", icon: Users },
    { title: "Actividad", description: "Interacciones, seguimientos, tareas completadas.", icon: Activity },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Reportes</h1>
      <p className="text-muted-foreground">Visualiza el rendimiento de tu concesionario.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
              <report.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div> {/* Placeholder for data */}
              <p className="text-xs text-muted-foreground">{report.description}</p>
            </CardContent>
            {/* Potentially add a link/button to view the full report */}
            {/* <CardFooter><Button size="sm">Ver Reporte</Button></CardFooter> */}
          </Card>
        ))}
      </div>

       {/* Placeholder for more detailed charts/tables */}
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Visión General (Ejemplo)</CardTitle>
                <CardDescription>Un gráfico o tabla iría aquí.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
                [Placeholder para Gráfico/Tabla]
            </CardContent>
        </Card>
    </div>
  );
}
