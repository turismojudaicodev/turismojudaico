import { useState } from 'react';
// 🚀 NUEVO: Importamos tu conexión a la base de datos
import { db } from '../../../lib/mysql'; // <-- Ajusta el nombre a mysql.js o db.js según tu proyecto

// 🧠 EL DICCIONARIO
const cityConfig = {
  "Tour Judaico en Buenos Aires": {
    tours: ["Traditional Tour (4 hrs)", "Mix Tour (6 hrs)", "Mix Tour (8 hrs)", "Walking Tour (3 hrs)"],
    requirePassport: false,
    extraQuestions: [
      { id: "amia", label: "Would you like to add the inside visit to AMIA? (Morning only, +$20 USD)" }
    ]
  },
  "Puerto Rico": {
    tours: ["Half Day (2.30 hrs)", "Full Day (including tourist attractions)"],
    requirePassport: false,
    extraQuestions: []
  },
  "Tour Judaico Rio de Janeiro  ": {
    tours: ["Half-day (4 hrs)", "Extended (6 hrs)", "Full Day (8 hrs)", "Walking Tour"],
    requirePassport: true,
    extraQuestions: [
      { id: "airport_transfer", label: "Do you need extra transportation to GIG international airport?" }
    ]
  },
  "Tour Judaico en Santiago": {
    tours: ["Half Day (4-5 hrs)", "Full Day (6-7 hrs)"],
    requirePassport: true,
    extraQuestions: [
      { id: "airport_port_transfer", label: "Do you need pick-up or drop-off at the Airport, Valparaiso, or San Antonio cruise dock?" }
    ]
  },
  // Puedes seguir agregando ciudades...
};

// 🚀 NUEVO: El Detective (Se ejecuta en el servidor antes de cargar la web)
export async function getServerSideProps(context) {
  const { uuid } = context.params;

  try {
    const [rows] = await db.promise().query(
      'SELECT destination_name FROM bookings_pipeline WHERE booking_uuid = ?',
      [uuid]
    );

    // Si el UUID no existe en tu panel, mostramos página de error 404
    if (rows.length === 0) {
      return { notFound: true }; 
    }

    // Le pasamos la ciudad y el UUID al formulario visual
    return {
      props: {
        uuid,
        destinationCity: rows[0].destination_name,
      },
    };
  } catch (error) {
    console.error('Error buscando destino:', error);
    return { notFound: true };
  }
}

// 🎨 EL FORMULARIO (Ahora recibe los datos del detective)
export default function SecurityPortal({ uuid, destinationCity }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cargamos las reglas de la ciudad detectada (Si no está en el diccionario, usa un perfil genérico)
  const config = cityConfig[destinationCity] || { tours: ["Standard Tour"], requirePassport: true, extraQuestions: [] };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    formData.append('booking_uuid', uuid);
    formData.append('destination_city', destinationCity); // Guardamos la ciudad por las dudas

    try {
      const response = await fetch('/api/security/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('✅ ¡Information sent successfully!');
      } else {
        alert('❌ Error sending information.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Jewish Tours - Trip Details & Security</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
        Please complete your travel details for <b>{destinationCity}</b>.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* --- LOGÍSTICA INTELIGENTE --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #3498db', borderRadius: '5px', backgroundColor: '#ebf5fb' }}>
          <legend style={{ fontWeight: 'bold', color: '#2980b9' }}>Tour Preferences</legend>
          
          <label style={{fontWeight: 'bold', fontSize: '14px'}}>Which Tour Option do you prefer?</label>
          <select name="tour_type" className="form-control mb-2" required>
            <option value="">Select a tour...</option>
            {config.tours.map(tour => (
              <option key={tour} value={tour}>{tour}</option>
            ))}
          </select>

          <label style={{fontWeight: 'bold', fontSize: '14px'}}>Suggested Starting Time:</label>
          <input type="time" name="start_time" className="form-control mb-2" required />

          <input type="text" name="hotel_name" placeholder="Hotel Name / Pick-up Address" className="form-control mb-2" required />
          <input type="text" name="dropoff_location" placeholder="Drop-off Address (If different from Pick-up)" className="form-control" />
          
          {config.extraQuestions.map(q => (
            <div className="form-check mt-3" key={q.id}>
              <input type="checkbox" name={`extra_${q.id}`} id={q.id} className="form-check-input" />
              <label htmlFor={q.id} className="form-check-label text-dark" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {q.label}
              </label>
            </div>
          ))}
        </fieldset>

        {/* --- DATOS GENERALES --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>Passengers Information</legend>
          <input type="text" name="passengers_names" placeholder="Full Names (e.g. John Doe, Jane Doe)" className="form-control mb-2" required />
          <input type="text" name="passengers_ages" placeholder="Ages (e.g. 45, 42)" className="form-control mb-2" required />
          <input type="text" name="phone_number" placeholder="Phone Number (WhatsApp)" className="form-control mb-2" required />
          <input type="text" name="home_address" placeholder="City where you live" className="form-control mb-2" required />
          <div className="form-check mt-2 mb-2">
            <input type="checkbox" name="difficulty_walking" id="difficulty_walking" className="form-check-input" />
            <label htmlFor="difficulty_walking" className="form-check-label text-danger" style={{ fontSize: '14px' }}>
              Does any participant have difficulty walking?
            </label>
          </div>
        </fieldset>

        {/* --- DATOS COMUNITARIOS --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>Community Background</legend>
          <input type="text" name="community_name" placeholder="Name of your home Jewish Community" className="form-control mb-2" required />
          <select name="religious_denomination" className="form-control mb-2" required>
            <option value="">Denomination...</option>
            <option value="Orthodox">Orthodox</option>
            <option value="Conservative">Conservative</option>
            <option value="Reform">Reform</option>
            <option value="Other">Other</option>
          </select>
        </fieldset>

        {/* --- MAGIA: SECCIÓN DE PASAPORTES CONDICIONAL --- */}
        {config.requirePassport && (
          <fieldset style={{ padding: '15px', border: '1px solid #e74c3c', borderRadius: '5px', backgroundColor: '#fdf3f2' }}>
            <legend style={{ fontWeight: 'bold', color: '#c0392b' }}>Passport Upload</legend>
            <p style={{ fontSize: '12px', color: '#555' }}>Please upload a clear photo of the passport data page for all passengers.</p>
            <input type="file" name="passport_files" accept="image/*,application/pdf" multiple required className="form-control" />
          </fieldset>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ padding: '15px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
        >
          {isSubmitting ? 'Processing & Sending...' : 'Submit Security Information'}
        </button>
      </form>
    </div>
  );
}