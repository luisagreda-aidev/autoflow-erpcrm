// @/app/reports/page.tsx
"use client"; // Required for charts and data fetching hook

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, Users, Car, Activity, Loader2, AlertTriangle } from "lucide-react";
import { getVehicleReportData, type VehicleReportData } from "@/lib/reports"; // Import report data fetching function
import { useToast } from "@/hooks/use-toast";

// Define chart configurations for styling
const statusChartConfig = {
  count: {
    label: "Cantidad",
  },
  disponible: {
    label: "Disponible",
    color: "hsl(var(--success))",
  },
  reservado: {
    label: "Reservado",
    color: "hsl(var(--warning))",
  },
  vendido: {
    label: "Vendido",
    color: "hsl(var(--destructive))",
  },
  "en preparacion": { // Use lowercase keys matching data
    label: "En Preparación",
    color: "hsl(var(--info))",
  },
  comprado: {
    label: "Comprado",
    color: "hsl(var(--secondary-foreground))",
  },
} satisfies ChartConfig;


export default function ReportsPage() {
  const { toast } = useToast();
  const [reportData, setReportData] = React.useState<VehicleReportData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getVehicleReportData();
        setReportData(data);
      } catch (err: any) {
        console.error("Error fetching report data:", err);
        setError("No se pudieron cargar los datos de los reportes.");
        toast({
          title: "Error en Reportes",
          description: err.message || "No se pudieron cargar los datos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]); // Add toast to dependency array

  const statusChartData = React.useMemo(() => {
    if (!reportData?.vehiclesByStatus) return [];
    return Object.entries(reportData.vehiclesByStatus)
        .map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize status
        count: count,
        // Map status to lowercase key for config lookup
        fillKey: status.toLowerCase().replace(/\s+/g, ''), // e.g., "En preparación" -> "enpreparacion" - Adjusted to match config
    }));
    // Re-adjust fillKey mapping if needed based on actual keys in reportData.vehiclesByStatus
  }, [reportData]);

  const reportSummaryCards = [
    { title: "Vehículos Totales", value: reportData?.totalVehicles ?? '--', description: "Número total en inventario.", icon: Car },
    { title: "Precio Promedio", value: reportData?.averagePrice ? reportData.averagePrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '--', description: "Valor promedio de venta.", icon: BarChart3 },
    { title: "Kilometraje Promedio", value: reportData?.averageMileage ? reportData.averageMileage.toLocaleString('es-ES') + ' km' : '--', description: "Promedio de km recorridos.", icon: Activity },
    // Add more cards as needed, e.g., for Leads once implemented
    { title: "Leads (Próximamente)", value: '--', description: "Rendimiento de leads.", icon: Users },
  ];


  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Reportes</h1>
      <p className="text-muted-foreground">Visualiza el rendimiento de tu concesionario.</p>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Cargando reportes...</span>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="col-span-full bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
             <AlertTriangle className="h-6 w-6 text-destructive" />
             <div>
                 <CardTitle className="text-destructive">Error al Cargar Reportes</CardTitle>
                 <CardDescription className="text-destructive/80">{error}</CardDescription>
             </div>
          </CardHeader>
        </Card>
      )}

      {/* Content */}
      {!isLoading && !error && reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportSummaryCards.map((report, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                  <report.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.value}</div>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vehicle Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vehículos por Estado</CardTitle>
              <CardDescription>Distribución actual del inventario según su estado.</CardDescription>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                 <ChartContainer config={statusChartConfig} className="min-h-[200px] w-full h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart
                        accessibilityLayer
                        data={statusChartData}
                        margin={{ top: 20, left: -10, right: 0, bottom: 0 }}
                     >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                         dataKey="status"
                         tickLine={false}
                         tickMargin={10}
                         axisLine={false}
                         // tickFormatter={(value) => value.slice(0, 3)} // Use if labels are too long
                       />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
                        <Tooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" hideLabel />}
                        />
                       <Bar dataKey="count" radius={4}>
                         <LabelList
                            position="top"
                            offset={8}
                            className="fill-foreground text-xs"
                            formatter={(value: number) => value.toLocaleString()}
                         />
                         {statusChartData.map((entry) => (
                           <Bar
                             key={entry.status} // Use unique key
                              dataKey="count" // Ensure this matches the data structure
                              fill={`var(--color-${entry.fillKey})`} // Use mapped fillKey
                              radius={4}
                           />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </ChartContainer>
              ) : (
                 <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
                   No hay datos de vehículos para mostrar el gráfico.
                 </div>
              )}
            </CardContent>
          </Card>

          {/* Placeholder for more detailed charts/tables */}
          {/* <Card className="mt-6">
            <CardHeader>
                <CardTitle>Otro Reporte (Ejemplo)</CardTitle>
                <CardDescription>Un gráfico o tabla iría aquí.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
                [Placeholder para Gráfico/Tabla]
            </CardContent>
          </Card> */}
        </>
      )}

       {/* Empty state if no data and not loading/error */}
       {!isLoading && !error && !reportData && (
         <Card className="col-span-full flex flex-col items-center justify-center py-16 border-dashed border-2 mt-8">
            <CardHeader className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl">No hay datos disponibles</CardTitle>
                <CardDescription>Aún no hay suficiente información para generar reportes.</CardDescription>
            </CardHeader>
         </Card>
       )}

    </div>
  );
}
