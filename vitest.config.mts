import { defineConfig } from 'vitest/config'

// En Windows, una ruta con la unidad en minúscula ("c:\") hace que Vitest cargue dos copias de sí mismo
// y todas las suites fallen al iniciar. Se normaliza la raíz a mayúscula.
const root = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase())

export default defineConfig({
  root,
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
