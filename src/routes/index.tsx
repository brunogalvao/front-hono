import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import List from '@/pages/List';
import Income from '@/pages/Income';
import RegisterUser from '@/components/RegisterUser';
import EditUser from '@/pages/EditUser';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <RegisterUser />,
  },
  // Rota protegida para o CRUD (você precisará implementar a lógica de proteção)
  // Rotas Administrativas
  {
    path: '/admin/editUser',
    element: <EditUser />,
  },
  {
    path: '/admin/list',
    element: <List />,
  },
  {
    path: '/admin/income',
    element: <Income />,
  },
  {
    path: '*',
    element: <Login />,
  },
]);

export default router;
