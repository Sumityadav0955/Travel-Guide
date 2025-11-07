// Router configuration for the Offbeat Travel App
import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Loading from '../components/common/Loading';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROUTES as _ROUTES } from '../constants/routes';

// Lazy load components for better performance
const Home = lazy(() => import('../pages/Home.tsx'));
const Login = lazy(() => import('../pages/Login.tsx'));
const Register = lazy(() => import('../pages/Register.tsx'));
const Profile = lazy(() => import('../pages/Profile.tsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.tsx'));
const LocationDetail = lazy(() => import('../pages/LocationDetail.tsx'));
const LocationSubmit = lazy(() => import('../pages/LocationSubmit.tsx'));
const Search = lazy(() => import('../pages/Search.tsx'));

// Export routes for convenience
export { ROUTES } from '../constants/routes';

// Root layout component
const RootLayout = () => (
  <ErrorBoundary>
    <Layout>
      <Suspense fallback={<Loading message="Loading page..." />}>
        <Outlet />
      </Suspense>
    </Layout>
  </ErrorBoundary>
);

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: (
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/:userId?',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'locations/:id',
        element: <LocationDetail />,
      },
      {
        path: 'submit-location',
        element: (
          <ProtectedRoute>
            <LocationSubmit />
          </ProtectedRoute>
        ),
      },
      {
        path: 'search',
        element: <Search />,
      },
    ],
  },
]);

// Router provider component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;