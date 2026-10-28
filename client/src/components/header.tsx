import { Link, useNavigate } from "react-router"
import useAuth from "../context/useAuth"

const Header = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const handleLogout = () => {
        logout()
        navigate("/login")
    }
    return (<header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
        <h1 className="text-[1.4rem] font-bold text-primary">אב בית דיגיטלי</h1>
        {user && <nav className="flex flex-wrap items-center gap-4">
            <span className="user-name">{user.name}</span>
            <Link className="font-medium text-ink no-underline hover:text-primary" to="/tasks">רשימת הבקשות</Link>
            <Link className="font-medium text-ink no-underline hover:text-primary" to="/tasks/new">בקשה חדשה</Link>
            <button className="bg-transparent text-primary hover:bg-primary-soft" onClick={handleLogout}>התנתקות</button>
        </nav>}
    </header>)
}
export default Header