// Calcula la mayoría de edad a partir de una fecha declarada. Es una declaración, no una verificación.
export type AgeCheck = 'adulto' | 'menor' | 'fecha_invalida'

export function checkAge(day: number, month: number, year: number, minAge: number, today = new Date()): AgeCheck {
  const birth = new Date(year, month - 1, day)
  const valid = birth.getFullYear() === year && birth.getMonth() === month - 1 && birth.getDate() === day
  if (!valid || year < today.getFullYear() - 120 || birth > today) return 'fecha_invalida'

  let age = today.getFullYear() - year
  const beforeBirthday = today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)
  if (beforeBirthday) age--
  return age >= minAge ? 'adulto' : 'menor'
}
