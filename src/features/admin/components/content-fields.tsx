import { Field, TextArea } from '@/shared/components/ui/field'
import { CONTENT_TYPES, type ContentType } from '../content-config'
import { Checkbox, formatDate } from './checkbox'

// Campos genéricos según el tipo de contenido; el responsable y la publicación son comunes a todos
export function ContentFields({ type, values }: { type: ContentType; values?: Record<string, unknown> }) {
  const text = (name: string) => (values?.[name] == null ? '' : String(values[name]))
  return (
    <div className="space-y-4">
      {CONTENT_TYPES[type].fields.map((field) => {
        if (field.kind === 'textarea') {
          return <TextArea key={field.name} label={field.label} name={field.name} hint={field.hint} defaultValue={text(field.name)} rows={field.name === 'body' ? 12 : 4} />
        }
        return (
          <Field key={field.name} label={field.label} name={field.name} hint={field.hint}
            type={field.kind === 'number' ? 'number' : 'text'} defaultValue={field.kind === 'number' ? text(field.name) || '0' : text(field.name)}
            readOnly={type === 'paginas' && field.name === 'slug' && Boolean(values)} />
        )
      })}
      <Field label="Responsable del contenido" name="responsible" required defaultValue={text('responsible')} hint="Persona o área que aprobó este texto." />
      <Checkbox name="published" label="Publicado" defaultChecked={values?.published === true} />
      {values?.updated_at != null && <p className="text-xs text-muted-foreground">Última actualización: {formatDate(String(values.updated_at))}</p>}
    </div>
  )
}
