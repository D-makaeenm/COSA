import LoginPage from './components/LoginPage/LoginPage';
import TestPage from './components/Exampage/TestPage';
import AdminPage from './components/AdminPage/AdminPage';
import HomePage from './components/AdminPage/PanelPage/HomePage';
import Reports from './components/AdminPage/PanelPage/Reports';

// Danh sách các routes
const routes = [
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
                path: 'home', // Sub-route /admin/home
                element: <HomePage />,
            },
            {
                path: 'reports', // Sub-route /admin/reports
                element: <Reports />,
            },
            {
                path: '*', // Điều hướng mặc định
                element: <HomePage />,
            },
        ],
    },
];

export default routes;
