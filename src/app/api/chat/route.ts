import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { ASSISTANT_MODEL, isAssistantConfigured, publicEnv } from '@/shared/lib/env'
import { checkRateLimit, clientKey } from '@/shared/lib/rate-limit'
import { log } from '@/shared/lib/logger'
import { getBrandSettings } from '@/features/contenido/data'
import { MAX_BODY_BYTES, prepareConversation } from '@/features/asistente/guardrails'
import { buildInstructions } from '@/features/asistente/instructions'
import { createAssistantTools } from '@/features/asistente/tools'

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status })
}

export async function POST(request: Request) {
  if (!isAssistantConfigured()) return jsonError('asistente_no_configurado', 503)
  if (!checkRateLimit(await clientKey('asistente'), 20, 60_000)) return jsonError('limite', 429)
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return jsonError('cuerpo_invalido', 413)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('cuerpo_invalido', 400)
  }
  const conversation = prepareConversation(body)
  if (!conversation.ok) return jsonError(conversation.error, 400)

  const settingsResult = await getBrandSettings()
  const settings = settingsResult.status === 'ok' ? settingsResult.data : null
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: { 'HTTP-Referer': publicEnv.siteUrl, 'X-Title': 'Asistente tienda' },
  })

  const result = streamText({
    model: openrouter(ASSISTANT_MODEL),
    instructions: buildInstructions(settings),
    messages: await convertToModelMessages(conversation.messages),
    tools: createAssistantTools(settings),
    stopWhen: stepCountIs(5),
    maxOutputTokens: 800,
    temperature: 0.2,
    // Solo se registra el tipo de error: los mensajes pueden contener datos personales
    onError: ({ error }) => log('error', 'asistente', 'Fallo en la respuesta', { tipo: error instanceof Error ? error.name : 'desconocido' }),
  })

  return result.toUIMessageStreamResponse({
    onError: () => 'El asistente tuvo un problema al responder. Inténtalo de nuevo o habla con una persona.',
  })
}
