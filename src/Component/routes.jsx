import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Page from '../Page/page'
import SignUpPage from '../Page/SignUp/signUp'
import ProtectedRoute from './ProtectedRoute'
import Login from '../Page/Login/login'

export default function PageRoutes() {
    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SignUpPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/page" element={<ProtectedRoute> <Page/></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
        </>
    )
}