import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Analytics } from "@vercel/analytics/next";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Analytics />
      <AuthGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthGuard>
    </>
  );
}
