import LoginPage from './components/LoginPage/LoginPage';
import TestPage from './components/Exampage/TestPage';

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
];

export default routes;
