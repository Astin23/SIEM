import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export function RootLayout() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
      <Outlet />
    </main>
  );
}
