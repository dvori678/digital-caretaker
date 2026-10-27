import { createContext, useState, type ReactNode } from "react"
import type { Role } from "../types/role"
import { useQueryClient } from "@tanstack/react-query"

type User = { token: string, name: string, role: Role }
type AuthContextType = {
    user: User | null
    login: (newUser: User) => void
    logout: () => void
}
export const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const item = sessionStorage.getItem('user')
            if (!item) return null
            return JSON.parse(item)
        }
        catch {
            return null
        }
    })
    const queryClient = useQueryClient()
    const login = (newUser: User) => {
        setUser(newUser)
        sessionStorage.setItem('user', JSON.stringify(newUser))
    }
    const logout = () => {
        setUser(null)
        sessionStorage.removeItem('user')
        queryClient.clear()
    }
    return (<AuthContext value={{ user, login, logout }}>{children}</AuthContext>)
}
export default AuthProvider