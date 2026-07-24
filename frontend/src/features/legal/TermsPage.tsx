import { LegalLayout } from './LegalLayout'

export function TermsPage() {
  return (
    <LegalLayout title="Términos y Condiciones" updatedAt="21 de julio de 2026">
      <p>
        Estos Términos y Condiciones ("Términos") regulan el uso de AUREA Pet Spa (el "Servicio"), una plataforma de
        gestión para peluquerías caninas. Al crear una cuenta o usar el Servicio, aceptas estos Términos en nombre
        tuyo o del negocio que representas ("el Negocio").
      </p>

      <h2>1. Cuenta y responsabilidad</h2>
      <p>
        Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra bajo tu
        cuenta. Debes notificarnos de inmediato ante cualquier uso no autorizado.
      </p>

      <h2>2. Planes y facturación</h2>
      <p>
        El Servicio se ofrece bajo distintos planes de suscripción (Básico, Intermedio, Pro), cada uno con sus
        propias funcionalidades y precio mensual. Los cambios de plan y la facturación se coordinan directamente con
        nuestro equipo mientras no exista un método de pago automático habilitado dentro de la plataforma.
      </p>

      <h2>3. Datos de tus clientes</h2>
      <p>
        El Negocio es responsable de contar con el consentimiento necesario de sus propios clientes para registrar
        los datos de estos y de sus mascotas (incluyendo información de salud, fotografías y firmas) dentro del
        Servicio. Actuamos como encargados del tratamiento de esos datos en nombre del Negocio.
      </p>

      <h2>4. Uso aceptable</h2>
      <p>
        No debes usar el Servicio para actividades ilegales, para enviar comunicaciones no solicitadas, ni intentar
        vulnerar la seguridad de la plataforma o acceder a datos de otro tenant sin autorización.
      </p>

      <h2>5. Disponibilidad del servicio</h2>
      <p>
        Hacemos un esfuerzo razonable por mantener el Servicio disponible, pero no garantizamos que funcionará sin
        interrupciones. Podemos realizar mantenimiento programado con aviso previo cuando sea posible.
      </p>

      <h2>6. Cancelación</h2>
      <p>
        Puedes solicitar la cancelación de tu cuenta en cualquier momento. Conservamos tu información por un período
        razonable tras la cancelación en caso de que quieras reactivar tu cuenta, y luego la eliminamos conforme a
        nuestra Política de Privacidad.
      </p>

      <h2>7. Cambios a estos Términos</h2>
      <p>
        Podemos actualizar estos Términos ocasionalmente. Te notificaremos de cambios importantes por correo o dentro
        de la plataforma.
      </p>

      <h2>8. Contacto</h2>
      <p>Si tienes preguntas sobre estos Términos, escríbenos a hola@aureapetspa.com.</p>
    </LegalLayout>
  )
}
