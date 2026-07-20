import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminTenantsPage } from './features/admin/AdminTenantsPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ROLE_PLATFORM_ADMIN } from './features/auth/types'
import { ClientDetailPage } from './features/clients/ClientDetailPage'
import { ClientsListPage } from './features/clients/ClientsListPage'
import { PublicFormPage } from './features/public-form/PublicFormPage'
import { ServicesPage } from './features/services/ServicesPage'
import { DashboardPage } from './features/tenant/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/f/:slug" element={<PublicFormPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsListPage />} />
        <Route path="/clientes/:clientId" element={<ClientDetailPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
      </Route>

      <Route element={<ProtectedRoute requireRole={ROLE_PLATFORM_ADMIN} />}>
        <Route path="/admin" element={<AdminTenantsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
