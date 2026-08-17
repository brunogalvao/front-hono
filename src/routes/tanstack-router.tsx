import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import AuthCallback from '@/pages/AuthCallback';
import Income from '@/pages/admin/Income';
import EditUser from '@/pages/admin/EditUser';
import Dashboard from '@/pages/admin/Dashboard';
import History from '@/pages/admin/History';
import Advisor from '@/pages/admin/Advisor';
import Groups from '@/pages/admin/Groups';
import Invite from '@/pages/Invite';
// New pages
import RegisterPage from '@/pages/auth/RegisterPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import AcceptInvitePage from '@/pages/auth/AcceptInvitePage';
import InviteLandingPage from '@/pages/auth/InviteLandingPage';
import TransactionsPage from '@/pages/admin/TransactionsPage';
import RecurringPage from '@/pages/admin/RecurringPage';
import InsightsPage from '@/pages/admin/InsightsPage';
import InstallmentsPage from '@/pages/admin/InstallmentsPage';
import WorkspaceSettingsPage from '@/pages/admin/workspace/WorkspaceSettingsPage';
import PermissionsPage from '@/pages/admin/workspace/PermissionsPage';
import AccountSettingsPage from '@/pages/admin/AccountSettingsPage';

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});

// Public Routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Admin Routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: Admin,
});

const editUserRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/profile',
  component: EditUser,
});

const expensesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/expenses',
  beforeLoad: () => {
    throw redirect({
      to: '/admin/transactions',
      search: {
        month: undefined,
        year: undefined,
        status: undefined,
        highlight: undefined,
      },
      replace: true,
    });
  },
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

const historyRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/history',
  component: History,
});

const parcelasRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/installments',
  component: InstallmentsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    highlight:
      typeof search.highlight === 'string' ? search.highlight : undefined,
  }),
});

const advisorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/advisor',
  component: Advisor,
});

const groupsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/groups',
  component: Groups,
});

// New workspace-aware routes
const transactionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/transactions',
  component: TransactionsPage,
  validateSearch: (search: Record<string, unknown>) => {
    const parsedMonth = Number(search.month);
    const parsedYear = Number(search.year);
    const validStatuses = ['pago', 'pendente', 'recebido'] as const;
    const status = validStatuses.find((value) => value === search.status);

    return {
      month:
        Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
          ? parsedMonth
          : undefined,
      year:
        Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
          ? parsedYear
          : undefined,
      status,
      highlight:
        typeof search.highlight === 'string' && search.highlight.length <= 128
          ? search.highlight
          : undefined,
    };
  },
});

const recurringRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/recurring',
  component: RecurringPage,
});

const insightsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/insights',
  component: InsightsPage,
});

const workspaceSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/settings',
  component: WorkspaceSettingsPage,
});

const accountSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/account',
  component: AccountSettingsPage,
});

const permissionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/settings/members',
  component: PermissionsPage,
});

// Invite & Auth Routes
const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invite/$token',
  component: Invite,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    flow:
      search.flow === 'workspace-invite'
        ? ('workspace-invite' as const)
        : undefined,
    next:
      typeof search.next === 'string' && search.next.startsWith('/')
        ? search.next
        : undefined,
  }),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: ResetPasswordPage,
});

const acceptInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/accept-invite',
  component: AcceptInvitePage,
});

const workspaceInviteLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/workspace-invite',
  component: InviteLandingPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token:
      typeof search.token === 'string' && /^[a-f0-9]{64}$/.test(search.token)
        ? search.token
        : undefined,
  }),
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
  registerRoute,
  inviteRoute,
  authCallbackRoute,
  resetPasswordRoute,
  workspaceInviteLandingRoute,
  acceptInviteRoute,
  adminRoute.addChildren([
    editUserRoute,
    expensesRoute,
    dashboardRoute,
    incomeRoute,
    historyRoute,
    parcelasRoute,
    advisorRoute,
    groupsRoute,
    transactionsRoute,
    recurringRoute,
    insightsRoute,
    workspaceSettingsRoute,
    accountSettingsRoute,
    permissionsRoute,
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
