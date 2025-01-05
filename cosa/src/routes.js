import LoginPage from './components/LoginPage/LoginPage';
import TestPage from './components/Exampage/TestPage';
import AdminPage from './components/AdminPage/AdminPage';
import HomePage from './components/AdminPage/PanelPage/HomePage';
import Reports from './components/AdminPage/PanelPage/Reports';
import NotFoundPage from "./components/NotFoundPage/NotFoundPage";
import CreateAccPage from './components/AdminPage/PanelPage/CreateAccPage';
import { Navigate } from 'react-router-dom';

// Danh sách các routes
const routes = [
    // {
    //     path: '',
    //     element: <Navigate to="/login" replace />,
    // },
    {
        path: '/login', // Trang đăng nhập
        element: <LoginPage />,
    },
    {
        path: '/test', // Trang test
        element: <TestPage />,
    },
    {
        path: '/admin', // AdminPage
        element: <AdminPage />,
        children: [
            {
                path: '', // Điều hướng mặc định từ /admin
                element: <Navigate to="home" replace />,
            },
            {
                path: 'home', // Sub-route /admin/home
                element: <HomePage />,
            },
            {
                path: 'reports', // Sub-route /admin/reports
                element: <Reports />,
            },
            {
                path: 'createUser', // Điều hướng mặc định
                element: <CreateAccPage />,
            },
            {
                path: '', // Điều hướng mặc định
                element: <HomePage />,
            },
            {
                path: '*', // Điều hướng mặc định
                element: <NotFoundPage />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

export default routes;
