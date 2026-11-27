// Preguntas extra del formulario de reserva. Con las respuestas el sistema elige los bloques de los mails
// (crucero, comida kosher, valijas). Se usa en las dos páginas del tour.
import { useState } from 'react'
import { InputText, Select } from '@/components/DashboardComponents'

const yesNo = [
  { codigo: 'no', nombre: 'No', nombre_en: 'No' },
  { codigo: 'si', nombre: 'Sí', nombre_en: 'Yes' },
]

// Puertos de crucero que cambian el texto de los mails (traslados que se ofrecen o no).
export const CRUISE_PORTS = [
  { codigo: 'amador', nombre: 'Amador (Panamá)', nombre_en: 'Amador (Panama)' },
  { codigo: 'colon', nombre: 'Colón (Panamá)', nombre_en: 'Colón (Panama)' },
  { codigo: 'santos', nombre: 'Santos (Brasil)', nombre_en: 'Santos (Brazil)' },
  { codigo: 'rio', nombre: 'Río de Janeiro', nombre_en: 'Rio de Janeiro' },
  { codigo: 'san_antonio', nombre: 'San Antonio / Valparaíso (Chile)', nombre_en: 'San Antonio / Valparaíso (Chile)' },
  { codigo: 'callao', nombre: 'Callao (Perú)', nombre_en: 'Callao (Peru)' },
  { codigo: 'buenos_aires', nombre: 'Buenos Aires', nombre_en: 'Buenos Aires' },
  { codigo: 'montevideo', nombre: 'Montevideo', nombre_en: 'Montevideo' },
  { codigo: 'punta_del_este', nombre: 'Punta del Este', nombre_en: 'Punta del Este' },
  { codigo: 'otro', nombre: 'Otro', nombre_en: 'Other' },
]

export default function BookingExtraQuestions({ labels = {}, locale = 'es' }) {
  const [cruise, setCruise] = useState('no')

  return (
    <>
      <Select
        label={labels.cruise}
        name="extra_crucero"
        options={yesNo}
        defaultValue="no"
        noEmptyOption
        locale={locale}
        attrs={{ onChange: (e) => setCruise(e.target.value) }}
      />
      {cruise === 'si' && (
        <>
          <Select label={labels.cruisePort} name="extra_crucero_puerto" options={CRUISE_PORTS} locale={locale} />
          <InputText label={labels.cruiseShip} name="extra_crucero_barco" attrs={{ maxLength: 100 }} />
        </>
      )}
      <Select label={labels.kosher} name="extra_kosher" options={yesNo} defaultValue="no" noEmptyOption locale={locale} />
      <Select label={labels.luggage} name="extra_valijas" options={yesNo} defaultValue="no" noEmptyOption locale={locale} />
    </>
  )
}
