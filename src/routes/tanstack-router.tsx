import {
  createRouter,
  createRoute,
  createRootRoute,
  lazyRouteComponent,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import Home from '@/pages/Home';

const Login = lazyRouteComponent(() => import('@/pages/Login'));
const Admin = lazyRouteComponent(() => import('@/pages/Admin'));
const AuthCallback = lazyRouteComponent(() => import('@/pages/AuthCallback'));
const Income = lazyRouteComponent(() => import('@/pages/admin/Income'));
const EditUser = lazyRouteComponent(() => import('@/pages/admin/EditUser'));
const Dashboard = lazyRouteComponent(() => import('@/pages/admin/Dashboard'));
const History = lazyRouteComponent(() => import('@/pages/admin/History'));
const Advisor = lazyRouteComponent(() => import('@/pages/admin/Advisor'));
const Groups = lazyRouteComponent(() => import('@/pages/admin/Groups'));
const Invite = lazyRouteComponent(() => import('@/pages/Invite'));
const RegisterPage = lazyRouteComponent(
  () => import('@/pages/auth/RegisterPage')
);
const ResetPasswordPage = lazyRouteComponent(
  () => import('@/pages/auth/ResetPasswordPage')
);
const AcceptInvitePage = lazyRouteComponent(
  () => import('@/pages/auth/AcceptInvitePage')
);
const InviteLandingPage = lazyRouteComponent(
  () => import('@/pages/auth/InviteLandingPage')
);
const TransactionsPage = lazyRouteComponent(
  () => import('@/pages/admin/TransactionsPage')
);
const RecurringPage = lazyRouteComponent(
  () => import('@/pages/admin/RecurringPage')
);
const InsightsPage = lazyRouteComponent(
  () => import('@/pages/admin/InsightsPage')
);
const InstallmentsPage = lazyRouteComponent(
  () => import('@/pages/admin/InstallmentsPage')
);
const WorkspaceSettingsPage = lazyRouteComponent(
  () => import('@/pages/admin/workspace/WorkspaceSettingsPage')
);
const PermissionsPage = lazyRouteComponent(
  () => import('@/pages/admin/workspace/PermissionsPage')
);
const AccountSettingsPage = lazyRouteComponent(
  () => import('@/pages/admin/AccountSettingsPage')
);

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
