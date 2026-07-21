import { Navigate, Route, Routes } from 'react-router-dom'
import { NotFoundRedirect } from './components/NotFoundRedirect'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminTenantsPage } from './features/admin/AdminTenantsPage'
import { AgendaPage } from './features/appointments/AgendaPage'
import { HistorialPage } from './features/appointments/HistorialPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ROLE_MANAGER, ROLE_PLATFORM_ADMIN, ROLE_TENANT_OWNER } from './features/auth/types'
import { SettingsPage } from './features/settings/SettingsPage'
import { ClientDetailPage } from './features/clients/ClientDetailPage'
import { ClientsListPage } from './features/clients/ClientsListPage'
import { EmployeesPage } from './features/employees/EmployeesPage'
import { CashRegisterPage } from './features/cash-register/CashRegisterPage'
import { PetDetailPage } from './features/pets/PetDetailPage'
import { ProductDetailPage } from './features/products/ProductDetailPage'
import { ProductsPage } from './features/products/ProductsPage'
import { PublicFormPage } from './features/public-form/PublicFormPage'
import { ServicesPage } from './features/services/ServicesPage'
import { StatsPage } from './features/stats/StatsPage'
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
        <Route path="/mascotas/:petId" element={<PetDetailPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/inventario" element={<ProductsPage />} />
        <Route path="/inventario/:productId" element={<ProductDetailPage />} />
        <Route path="/caja" element={<CashRegisterPage />} />
        <Route path="/estadisticas" element={<StatsPage />} />
      </Route>

      <Route element={<ProtectedRoute requireAnyRole={[ROLE_TENANT_OWNER, ROLE_MANAGER]} />}>
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/empleados" element={<EmployeesPage />} />
      </Route>

      <Route element={<ProtectedRoute requireRole={ROLE_TENANT_OWNER} />}>
        <Route path="/configuracion" element={<SettingsPage />} />
      </Route>

      <Route element={<ProtectedRoute requireRole={ROLE_PLATFORM_ADMIN} />}>
        <Route path="/admin" element={<AdminTenantsPage />} />
      </Route>

      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  )
}

export default App
