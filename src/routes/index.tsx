import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import User from "@/pages/User";
import RegisterUser from "@/components/RegisterUser";
import Admin from "@/pages/Admin";
import List from "@/pages/List";
import Income from "@/pages/Income";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <RegisterUser />,
  },
  // Rota protegida para o CRUD (você precisará implementar a lógica de proteção)
  // Rotas Administrativas
  {
    path: "/admin/list",
    element: <Admin />,
    // Aqui você pode adicionar uma verificação de autenticação
  },
  {
    path: "/admin/user",
    element: <User />,
  },
  {
    path: "/admin/list",
    element: <List />,
  },
  {
    path: "/admin/income",
    element: <Income />,
  },
]);

export default router;
