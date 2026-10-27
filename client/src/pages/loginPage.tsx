import { Navigate } from 'react-router'
import LoginForm from '../components/loginForm'
import useAuth from '../context/useAuth'

const LoginPage = () => {
    const { user } = useAuth()
    if (user) {
        return <Navigate to="/tasks" replace />
    }
    return (<>
   <h2 className="login-title">התחברות</h2> 
    <LoginForm />
    </>)
}
export default LoginPage