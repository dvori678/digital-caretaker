import "./index.css"
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import App from './App'
import AuthProvider from './context/authContext'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider><App/></AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)
