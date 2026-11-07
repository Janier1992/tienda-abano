// Configuración de los tipos de contenido editables desde el panel
export type ContentType = 'faqs' | 'servicios' | 'paginas'

export interface ContentField {
  name: string
  label: string
  kind: 'text' | 'textarea' | 'number' | 'checkbox'
  hint?: string
}

export const CONTENT_TYPES: Record<ContentType, { table: string; key: string; title: string; titleField: string; fields: ContentField[] }> = {
  faqs: {
    table: 'faqs',
    key: 'id',
    title: 'Preguntas frecuentes',
    titleField: 'question',
    fields: [
      { name: 'question', label: 'Pregunta', kind: 'text' },
      { name: 'answer', label: 'Respuesta oficial', kind: 'textarea', hint: 'El asistente virtual usa este texto literalmente.' },
      { name: 'position', label: 'Orden', kind: 'number' },
    ],
  },
  servicios: {
    table: 'services',
    key: 'id',
    title: 'Servicios',
    titleField: 'name',
    fields: [
      { name: 'name', label: 'Nombre', kind: 'text' },
      { name: 'description', label: 'Descripción', kind: 'textarea' },
      { name: 'conditions', label: 'Condiciones', kind: 'textarea' },
      { name: 'availability', label: 'Disponibilidad', kind: 'text', hint: 'Solo horarios o fechas confirmados por la marca.' },
    ],
  },
  paginas: {
    table: 'content_pages',
    key: 'slug',
    title: 'Páginas y políticas',
    titleField: 'title',
    fields: [
      { name: 'slug', label: 'Identificador (URL)', kind: 'text', hint: 'Ej.: privacidad, envios, devoluciones, condiciones.' },
      { name: 'title', label: 'Título', kind: 'text' },
      { name: 'body', label: 'Contenido', kind: 'textarea', hint: 'Texto aprobado por el responsable legal o comercial.' },
    ],
  },
}

export function isContentType(value: string): value is ContentType {
  return value in CONTENT_TYPES
}
