import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "@/components/Loading";

// Lazy load all pages
const Admin = lazy(() => import("@/pages/Admin"));
const Login = lazy(() => import("@/pages/Login"));
const Home = lazy(() => import("@/pages/Home"));
const List = lazy(() => import("@/pages/admin/List"));
const Income = lazy(() => import("@/pages/admin/Income"));
const EditUser = lazy(() => import("@/pages/admin/EditUser"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          <Route path="/admin" element={<Admin />}>
            <Route index element={<List />} />
            <Route path="editUser" element={<EditUser />} />
            <Route path="list" element={<List />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="income" element={<Income />} />
          </Route>
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
