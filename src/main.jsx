import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import PublicDashboard from './PublicDashboard.jsx'
import './index.css'

// Définition des routes
const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/public/:wallet', element: <PublicDashboard /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
