import { Navigate } from 'react-router'
import LoginForm from '../components/loginForm'
import useAuth from '../context/useAuth'

const LoginPage = () => {
    const { user } = useAuth()
    if (user) {
        return <Navigate to="/tasks" replace />
    }
    return (<>
   <h2 className="mt-8 text-center text-[1.6rem] font-bold text-primary">התחברות</h2> 
    <LoginForm />
    </>)
}
export default LoginPage