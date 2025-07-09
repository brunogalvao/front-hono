import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import List from "@/pages/admin/List";
import Income from "./pages/admin/Income";
import EditUser from "./pages/admin/EditUser";
import Dashboard from "./pages/admin/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<List />} /> {/* rota padrão */}
          <Route path="editUser" element={<EditUser />} />
          <Route path="list" element={<List />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="income" element={<Income />} />
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
