'use server'
import { type ActionState, toFieldErrors } from '@/shared/lib/action-state'
import { createSupportRequest, REQUEST_ERROR_MESSAGES } from './service'

// Acción de formulario: el contexto llega serializado en un campo oculto y se valida con Zod
export async function submitSupportRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let context: unknown = { origin: 'contacto' }
  try {
    context = JSON.parse(String(formData.get('context') ?? '{"origin":"contacto"}'))
  } catch {
    return { status: 'error', message: 'La solicitud no es válida. Recarga la página e inténtalo de nuevo.' }
  }

  const result = await createSupportRequest({
    type: formData.get('type'),
    contactName: formData.get('contactName'),
    contactEmail: formData.get('contactEmail'),
    message: formData.get('message'),
    consent: formData.get('consent') === 'on',
    context,
  })

  if (result.ok) {
    return {
      status: 'success',
      reference: result.reference,
      message: 'Hemos recibido tu solicitud. Un integrante del equipo la revisará y te responderá por correo.',
    }
  }
  if (result.reason === 'validacion') {
    return { status: 'error', message: 'Revisa los campos marcados.', fieldErrors: toFieldErrors(result.fieldErrors) }
  }
  return { status: 'error', message: REQUEST_ERROR_MESSAGES[result.reason] }
}
