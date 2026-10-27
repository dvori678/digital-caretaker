import { useContext } from "react"
import { AuthContext } from "./authContext"

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth חייב להיות בתוך AuthProvider")
  }
  return context
}
export default useAuth