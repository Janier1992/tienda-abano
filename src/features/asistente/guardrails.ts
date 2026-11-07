import { z } from 'zod'
import type { UIMessage } from 'ai'

// Funciones puras: se usan en el servidor (route) y en el cliente (resumen de derivación)

export const MAX_HISTORY = 12
export const MAX_TEXT_LENGTH = 1500
export const MAX_BODY_BYTES = 64_000

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().max(100),
        role: z.enum(['user', 'assistant', 'system']),
        parts: z.array(z.looseObject({ type: z.string() })).max(50),
      }),
    )
    .min(1)
    .max(100),
})

export type ChatTextMessage = Pick<UIMessage, 'id' | 'role'> & { parts: { type: 'text'; text: string }[] }

export type PreparedConversation =
  | { ok: true; messages: ChatTextMessage[] }
  | { ok: false; error: 'cuerpo_invalido' | 'mensaje_vacio' }

export function isBlank(text: string): boolean {
  return text.replace(/[\s\p{P}]/gu, '').length === 0
}

export function capText(text: string, max = MAX_TEXT_LENGTH): string {
  return text.length > max ? text.slice(0, max) : text
}

function extractText(parts: { type: string }[]): string {
  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && typeof (part as { text?: unknown }).text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim()
}

// El historial llega del navegador y no es confiable: se descartan mensajes "system" y
// partes de herramientas (podrían falsificar datos oficiales); el modelo vuelve a consultar.
export function prepareConversation(body: unknown): PreparedConversation {
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return { ok: false, error: 'cuerpo_invalido' }

  const messages = parsed.data.messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({ id: message.id, role: message.role, text: capText(extractText(message.parts)) }))
    .filter((message) => !isBlank(message.text))
    .slice(-MAX_HISTORY)
    .map(({ id, role, text }): ChatTextMessage => ({ id, role, parts: [{ type: 'text', text }] }))

  const last = messages.at(-1)
  if (!last || last.role !== 'user') return { ok: false, error: 'mensaje_vacio' }
  return { ok: true, messages }
}

// Resumen para el asesor humano: solo lo que el usuario escribió, acotado
export function buildHandoffSummary(messages: Pick<UIMessage, 'role' | 'parts'>[], maxLength = 1200): string {
  const userTexts = messages
    .filter((message) => message.role === 'user')
    .map((message) => extractText(message.parts))
    .filter((text) => !isBlank(text))
    .slice(-5)
  if (userTexts.length === 0) return ''
  const summary = `Consulta iniciada con el asistente. Mensajes del cliente:\n- ${userTexts.join('\n- ')}`
  return capText(summary, maxLength)
}
