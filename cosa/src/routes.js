import LoginPage from './components/LoginPage/LoginPage';
import TestPage from './components/StudentPage/TestPage';
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
import EditContest from './components/AdminPage/PanelPage/EditContest/EditContest';
import Questions from './components/StudentPage/Question/Question';
import ExamQuestion from './components/StudentPage/ExamQuestion/ExamQuestion';
import AddStudent from './components/AdminPage/PanelPage/ListContest/AddStudent';
import ContestInfo1 from './components/AdminPage/PanelPage/ListContest/ContestInfo1';
import RuleAndStart from './components/StudentPage/Rule/RuleAndStart';
import { Navigate } from 'react-router-dom';
import App from './App';
import ContestDetails from './components/AdminPage/PanelPage/EditContest/ContestDetails';

// Danh sách các routes
const routes = [
    {
        path: '/test',
        element: <App />
    },
    {
        path: '',
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login', // Trang đăng nhập
        element: <LoginPage />,
    },
    {
        path: '/student', // Trang test
        children: [
            {
                path: '', // Điều hướng mặc định từ /admin
                element: <Navigate to="start" replace />,
            },
            {
                path: "start",
                element: <TestPage />,
                children: [
                    {
                        path: "",
                        element: <RuleAndStart />,
                    },
                    {
                        path: "exam/:examId/questions",
                        element: <Questions />,
                    },
                    {
                        path: "exam/:examId/questions/:questionId",
                        element: <ExamQuestion />,
                    },
                ]
            },
        ],
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
                        path: 'contests/:id',
                        element: <ContestInfo />,
                        children: [
                            {
                                path: 'add-student',
                                element: <AddStudent />
                            },
                            {
                                path: '',
                                element: <ContestInfo1 />
                            },
                        ]
                    },
                    {
                        path: 'add-contest',
                        element: <AddContest />
                    },
                    {
                        path: 'edit-contest/:id',
                        element: <EditContest />
                    },
                    {
                        path: 'edit-contest-detail/:id',
                        element: <ContestDetails />
                    },
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
        path: '/teacher',
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
                        path: 'contests/:id',
                        element: <ContestInfo />,
                        children: [
                            {
                                path: 'add-student',
                                element: <AddStudent />
                            },
                            {
                                path: '',
                                element: <ContestInfo1 />
                            },
                        ]
                    },
                    {
                        path: 'add-contest',
                        element: <AddContest />
                    },
                    {
                        path: 'edit-contest/:id',
                        element: <EditContest />
                    },
                    {
                        path: 'edit-contest-detail/:id',
                        element: <ContestDetails />
                    },
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
                                element: <Navigate to="form-teacher" replace />,
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
                        path: 'list-teacher', // Danh sách tài khoản admin
                        element: <ListTeacher />,
                    },
                    {
                        path: 'list-student', // Danh sách tài khoản admin
                        element: <ListStudent />,
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
