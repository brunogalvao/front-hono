import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import User from "@/pages/User";
import RegisterUser from "@/components/RegisterUser";

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
  {
    path: "/admin",
    element: <Admin />,
    // Aqui você pode adicionar uma verificação de autenticação
  },
  {
    path: "/admin/user",
    element: <User />,
  },
]);

export default router;
