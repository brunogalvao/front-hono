import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";

import List from "@/pages/admin/List";
import Income from "@/pages/admin/Income";
import EditUser from "@/pages/admin/EditUser";
import Dashboard from "@/pages/admin/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // Rota protegida para o CRUD (você precisará implementar a lógica de proteção)
  // Rotas Administrativas
  {
    path: "/admin/editUser",
    element: <EditUser />,
  },
  {
    path: "/admin/list",
    element: <List />,
  },
  {
    path: "/admin/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin/income",
    element: <Income />,
  },
  {
    path: "*",
    element: <Login />,
  },
]);

export default router;
