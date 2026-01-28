import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban Auditor - Gestión de Tareas con Auditoría",
  description: "Sistema avanzado de gestión de tareas tipo Kanban con auditoría completa, búsqueda avanzada y modo de evaluación docente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
