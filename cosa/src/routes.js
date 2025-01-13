import LoginPage from './components/LoginPage/LoginPage';
import TestPage from './components/Exampage/TestPage';
import AdminPage from './components/AdminPage/AdminPage';
import HomePage from './components/AdminPage/PanelPage/HomePage';
import Reports from './components/AdminPage/PanelPage/Reports';
import NotFoundPage from "./components/NotFoundPage/NotFoundPage";
import CreateAccPage from './components/AdminPage/PanelPage/CreateAccPage';
import FormCreateAccount from './components/AdminPage/PanelPage/FormCreateAccount';
import Admin from './components/AdminPage/PanelPage/FormCreateAccount/Admin';
import Teacher from './components/AdminPage/PanelPage/FormCreateAccount/Teacher';
import Student from './components/AdminPage/PanelPage/FormCreateAccount/Student';
import ListAdmin from './components/AdminPage/PanelPage/ListAccount/ListAdmin';
import ListTeacher from './components/AdminPage/PanelPage/ListAccount/ListTeacher';
import ListStudent from './components/AdminPage/PanelPage/ListAccount/ListStudent';
import EditAdmin from './components/AdminPage/PanelPage/FormEditAccount/EditAdmin';
import EditTeacher from './components/AdminPage/PanelPage/FormEditAccount/EditTeacher';
import EditStudent from './components/AdminPage/PanelPage/FormEditAccount/EditStudent';
import ListContest from './components/AdminPage/PanelPage/ListContest/ListContest';
import ContestInfo from './components/AdminPage/PanelPage/ListContest/ContestInfo';
import AddContest from './components/AdminPage/PanelPage/AddContest/AddContest';
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
                path: 'list-contest',
                element: <ListContest />,
                children: [
                    {
                        path: 'contests/:id', // Route con để hiển thị chi tiết từng contest
                        element: <ContestInfo />
                    },
                    {
                        path: 'add-contest', // Route con để hiển thị chi tiết từng contest
                        element: <AddContest />
                    }
                ]
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
                        path: '',
                        element: <FormCreateAccount />,
                        children: [
                            {
                                path: '',
                                element: <Navigate to="form-admin" replace />,
                            },
                            {
                                path: 'form-admin',
                                element: <Admin />,
                            },
                            {
                                path: 'form-teacher',
                                element: <Teacher />,
                            },
                            {
                                path: 'form-student',
                                element: <Student />,
                            },
                        ],
                    },
                    {
                        path: 'list-admin', // Danh sách tài khoản admin
                        element: <ListAdmin />,
                    },
                    {
                        path: 'list-teacher', // Danh sách tài khoản admin
                        element: <ListTeacher />,
                    },
                    {
                        path: 'list-student', // Danh sách tài khoản admin
                        element: <ListStudent />,
                    },
                    {
                        path: 'edit-account-admin',
                        element: <EditAdmin />,
                    },
                    {
                        path: 'edit-account-teacher',
                        element: <EditTeacher />,
                    },
                    {
                        path: 'edit-account-student',
                        element: <EditStudent />,
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
