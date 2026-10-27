import { Link, useNavigate } from "react-router"
import useAuth from "../context/useAuth"

const Header = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const handleLogout = () => {
        logout()
        navigate("/login")
    }
    return (<header>
        <h1>אב בית דיגיטלי</h1>
        {user && <nav>
            <span className="user-name">{user.name}</span>
            <Link to="/tasks">רשימת הבקשות</Link>
            <Link to="/tasks/new">בקשה חדשה</Link>
            <button onClick={handleLogout}>התנתקות</button>
        </nav>}
    </header>)
}
export default Header