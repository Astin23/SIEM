import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { Login } from "@/pages/Auth/Login";
import { Signup } from "@/pages/Auth/Signup";
import { LandingPage } from "@/pages/Public/LandingPage";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { AlertsList } from "@/pages/Alerts/AlertsList";
import { AlertDetails } from "@/pages/Alerts/AlertDetails";
import { RulesList } from "@/pages/Rules/RulesList";
import { AnalyticsPage } from "@/pages/Analytics/AnalyticsPage";
import { AttackChains } from "@/pages/Analytics/AttackChains/AttackChains";
import { EventExplorer } from "@/pages/Hunting/EventExplorer";
import { IncidentsPage } from "@/pages/Incidents/IncidentsPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";
import { NotFound } from "@/pages/Placeholders";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "alerts", element: <AlertsList /> },
      { path: "alerts/:id", element: <AlertDetails /> },
      { path: "rules", element: <RulesList /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "analytics/attack-chains", element: <AttackChains /> },
      { path: "hunting", element: <EventExplorer /> },
      { path: "incidents", element: <IncidentsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
