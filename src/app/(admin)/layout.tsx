import { SidebarProvider } from "@/context/SidebarContext";
import AuthGuard from "@/components/AuthGuard";
import AdminLayoutContent from "./layout-content";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AuthGuard>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AuthGuard>
    </SidebarProvider>
  );
}
