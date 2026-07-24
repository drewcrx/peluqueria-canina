import { LegalLayout } from './LegalLayout'

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" updatedAt="21 de julio de 2026">
      <p>
        Esta Política de Privacidad explica qué información recopila AUREA Pet Spa (el "Servicio"), cómo la usamos y
        qué derechos tienes sobre ella.
      </p>

      <h2>1. Qué información recopilamos</h2>
      <p>
        <strong>De tu cuenta:</strong> nombre, correo electrónico y contraseña (almacenada de forma cifrada).
      </p>
      <p>
        <strong>De tu negocio:</strong> nombre de la peluquería, logo, color de marca, número de WhatsApp y dominio
        solicitado.
      </p>
      <p>
        <strong>De los clientes de tu negocio:</strong> nombre, teléfono, correo y dirección; y de sus mascotas:
        nombre, raza, edad, peso, vacunas, enfermedades, medicamentos, alergias, fotografías de las visitas y firma
        digital de autorización. Este tipo de datos lo ingresa el propio Negocio o sus clientes a través del
        formulario público, y el Negocio es responsable de contar con el consentimiento correspondiente.
      </p>

      <h2>2. Para qué usamos esta información</h2>
      <p>
        Para operar el Servicio (agenda, historial, notificaciones, estadísticas), para dar soporte técnico, y para
        cumplir obligaciones legales cuando corresponda. No vendemos información personal a terceros.
      </p>

      <h2>3. Dónde se almacena</h2>
      <p>
        Los datos se almacenan en una base de datos con aislamiento por negocio (cada peluquería solo puede ver su
        propia información). Las fotografías y firmas se guardan como archivos asociados a tu cuenta.
      </p>

      <h2>4. Con quién la compartimos</h2>
      <p>
        No compartimos tu información con terceros salvo que sea necesario para operar el Servicio (por ejemplo, un
        proveedor de almacenamiento de archivos), por obligación legal, o con tu consentimiento explícito.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Puedes solicitar acceso, corrección o eliminación de tu información y la de tu negocio en cualquier momento
        escribiéndonos. Los clientes finales de un Negocio deben dirigir esas solicitudes al Negocio, quien es el
        responsable directo de sus propios datos dentro de la plataforma.
      </p>

      <h2>6. Retención de datos</h2>
      <p>
        Conservamos la información mientras tu cuenta esté activa. Si cancelas tu cuenta, la conservamos por un
        período razonable y luego la eliminamos, salvo obligación legal de conservarla por más tiempo.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Usamos medidas técnicas razonables (cifrado de contraseñas, control de acceso por rol, aislamiento de datos
        por negocio) para proteger tu información, aunque ningún sistema es 100% infalible.
      </p>

      <h2>8. Contacto</h2>
      <p>Para preguntas sobre esta política o para ejercer tus derechos, escríbenos a hola@aureapetspa.com.</p>
    </LegalLayout>
  )
}
