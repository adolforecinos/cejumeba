export const calcularEstado = (promedio: number): 'APROBADO' | 'EN_RIESGO' | 'REPROBADO' => {
  if (promedio >= 70) return 'APROBADO'
  if (promedio >= 60) return 'EN_RIESGO'
  return 'REPROBADO'
}

export const calcularPromedioPonderado = (
  notas: { valor: number; ponderacion: number }[]
): number => {
  if (notas.length === 0) return 0
  const totalPonderacion = notas.reduce((s, n) => s + n.ponderacion, 0)
  if (totalPonderacion === 0) return 0
  const suma = notas.reduce((s, n) => s + (n.valor * n.ponderacion), 0)
  return Math.round((suma / totalPonderacion) * 100) / 100
}
