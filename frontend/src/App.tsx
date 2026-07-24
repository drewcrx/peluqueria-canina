import { Route, Routes } from 'react-router-dom'
import { NotFoundRedirect } from './components/NotFoundRedirect'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminTenantsPage } from './features/admin/AdminTenantsPage'
import { AgendaPage } from './features/appointments/AgendaPage'
import { HistorialPage } from './features/appointments/HistorialPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { ROLE_MANAGER, ROLE_PLATFORM_ADMIN, ROLE_TENANT_OWNER } from './features/auth/types'
import { SettingsPage } from './features/settings/SettingsPage'
import { ClientDetailPage } from './features/clients/ClientDetailPage'
import { ClientsListPage } from './features/clients/ClientsListPage'
import { EmployeesPage } from './features/employees/EmployeesPage'
import { CashRegisterPage } from './features/cash-register/CashRegisterPage'
import { MyBusinessPage } from './features/business/MyBusinessPage'
import { PrivacyPage } from './features/legal/PrivacyPage'
import { TermsPage } from './features/legal/TermsPage'
import { LandingPage } from './features/landing/LandingPage'
import { PetDetailPage } from './features/pets/PetDetailPage'
import { PetsListPage } from './features/pets/PetsListPage'
import { ProductDetailPage } from './features/products/ProductDetailPage'
import { ProductsPage } from './features/products/ProductsPage'
import { PublicFormPage } from './features/public-form/PublicFormPage'
import { PublicPetCardPage } from './features/public-pet-card/PublicPetCardPage'
import { ServicesPage } from './features/services/ServicesPage'
import { StatsPage } from './features/stats/StatsPage'
import { DashboardPage } from './features/tenant/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/olvide-mi-contrasena" element={<ForgotPasswordPage />} />
      <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route path="/f/:slug" element={<PublicFormPage />} />
      <Route path="/mascota/:petId" element={<PublicPetCardPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsListPage />} />
        <Route path="/clientes/:clientId" element={<ClientDetailPage />} />
        <Route path="/mascotas" element={<PetsListPage />} />
        <Route path="/mascotas/:petId" element={<PetDetailPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/inventario" element={<ProductsPage />} />
        <Route path="/inventario/:productId" element={<ProductDetailPage />} />
        <Route path="/caja" element={<CashRegisterPage />} />
        <Route path="/mi-negocio" element={<MyBusinessPage />} />
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
