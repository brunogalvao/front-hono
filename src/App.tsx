import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "@/pages/Admin";
import List from "@/pages/List";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Income from "./pages/Income";
import RegisterUser from "@/components/RegisterUser";
import EditUser from "./pages/EditUser";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterUser />} />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<List />} /> {/* rota padrão */}
          <Route path="editUser" element={<EditUser />} />
          <Route path="list" element={<List />} />
          <Route path="income" element={<Income />} />
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
