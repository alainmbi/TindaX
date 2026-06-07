export type KinshasaCommune = {
  name: string
  latitude: number
  longitude: number
}

export const kinshasaCommunes: KinshasaCommune[] = [
  { name: 'Gombe', latitude: -4.3116, longitude: 15.3129 },
  { name: 'Limete', latitude: -4.3306, longitude: 15.3302 },
  { name: 'Bandalungwa', latitude: -4.3389, longitude: 15.2815 },
  { name: 'Kasa-Vubu', latitude: -4.3271, longitude: 15.2967 },
  { name: 'Ngaliema', latitude: -4.3574, longitude: 15.2507 },
  { name: 'Lemba', latitude: -4.3902, longitude: 15.3126 },
  { name: 'Matete', latitude: -4.3837, longitude: 15.3412 },
  { name: 'Ndjili', latitude: -4.3858, longitude: 15.3733 },
  { name: 'Masina', latitude: -4.3829, longitude: 15.392 },
  { name: 'Kimbanseke', latitude: -4.4016, longitude: 15.4186 },
  { name: 'Kalamu', latitude: -4.3355, longitude: 15.3064 },
  { name: 'Barumbu', latitude: -4.3205, longitude: 15.3188 },
  { name: 'Kinshasa', latitude: -4.3278, longitude: 15.3132 },
  { name: 'Lingwala', latitude: -4.3197, longitude: 15.3009 },
  { name: 'Kintambo', latitude: -4.3412, longitude: 15.2768 },
  { name: 'Ngiri-Ngiri', latitude: -4.3476, longitude: 15.2998 },
  { name: 'Bumbu', latitude: -4.3693, longitude: 15.2955 },
  { name: 'Makala', latitude: -4.3767, longitude: 15.3032 },
  { name: 'Selembao', latitude: -4.3821, longitude: 15.2809 },
  { name: 'Mont-Ngafula', latitude: -4.4488, longitude: 15.2662 },
  { name: 'Nsele', latitude: -4.3365, longitude: 15.5164 },
  { name: 'Maluku', latitude: -4.287, longitude: 16.0 },
  { name: 'Kisenso', latitude: -4.3937, longitude: 15.3293 },
  { name: 'Ngaba', latitude: -4.3796, longitude: 15.3096 },
]

export function normalizeCommuneName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

export function findKinshasaCommuneByName(name?: string | null) {
  if (!name) {
    return null
  }

  const normalizedSearch = normalizeCommuneName(name)

  return (
    kinshasaCommunes.find((commune) => normalizeCommuneName(commune.name) === normalizedSearch) ??
    null
  )
}
