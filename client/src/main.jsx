import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import LoginPage from './Login.jsx';
import SignupPage from './Signup.jsx';

const router = createBrowserRouter([
    {path:"/", element:<App/>},
    {path:"/login", element: <LoginPage/>},
    {path:"/signup", element: <SignupPage/>}
]);

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
