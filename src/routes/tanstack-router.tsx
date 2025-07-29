import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import List from '@/pages/admin/List';
import Income from '@/pages/admin/Income';
import EditUser from '@/pages/admin/EditUser';
import Dashboard from '@/pages/admin/Dashboard';

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});

// Home Route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// Admin Routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: Admin,
});

const editUserRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/editUser',
  component: EditUser,
});

const listRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/list',
  component: List,
});

const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/dashboard',
  component: Dashboard,
});

const incomeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/income',
  component: Income,
});

// Catch-all route
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: Login,
});

// Route Tree
const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  adminRoute.addChildren([
    editUserRoute,
    listRoute,
    dashboardRoute,
    incomeRoute,
  ]),
  catchAllRoute,
]);

// Router
export const router = createRouter({ routeTree });

// Type declaration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
