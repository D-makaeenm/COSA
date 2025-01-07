import LoginPage from './components/LoginPage/LoginPage';
import TestPage from './components/Exampage/TestPage';
import AdminPage from './components/AdminPage/AdminPage';
import HomePage from './components/AdminPage/PanelPage/HomePage';
import Reports from './components/AdminPage/PanelPage/Reports';
import NotFoundPage from "./components/NotFoundPage/NotFoundPage";
import CreateAccPage from './components/AdminPage/PanelPage/CreateAccPage';
import ListAccountPage from './components/AdminPage/PanelPage/ListAccountPage';
import FormCreateAccount from './components/AdminPage/PanelPage/FormCreateAccount';
import Admin from './components/AdminPage/PanelPage/FormCreateAccount/Admin';
import { Navigate } from 'react-router-dom';

// Danh sách các routes
const routes = [
    {
        path: '',
        element: <Navigate to="/login" replace />,
    },
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
                children: [
                    {
                        path: '', // Điều hướng mặc định từ /admin/createUser
                        element: <FormCreateAccount />,
                        children: [
                            {
                                path: 'form-admin', // Danh sách tài khoản giáo viên
                                element: <Admin />,
                            },
                        ],
                    },
                    {
                        path: 'list', // Danh sách tài khoản admin
                        element: <ListAccountPage />,
                        children: [
                            {
                                path: 'list-admin', // Điều hướng mặc định từ /admin/createUser
                                element: <Admin />,
                            },
                        ],
                    },
                ],
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
