import { useState } from 'react';
import { db } from '../../../lib/mysql'; 

const cityConfig = {
  "Buenos Aires": {
    tours: ["Traditional Jewish Tour (4 hrs)", "Mix Tour (6 hrs)", "Mix Tour (8 hrs)", "Walking Tour (3 hrs)"],
    requirePassport: false,
    extraQuestions: [
      { id: "amia", label: "Add AMIA inside visit? (Morning only, +$20 USD/pax)" }
    ]
  },
  "Tour Judaico Rio de Janeiro": {
    tours: ["Half-day Tour (4 hrs)", "Mix Tour (6 hrs)", "Full Day Tour (8 hrs)", "Walking Tour (3 hrs)"],
    requirePassport: true,
    extraQuestions: [
      { id: "airport_transfer", label: "Need extra transportation to GIG international airport? (Extra cost)" }
    ]
  },
  "Santos": {
    tours: ["2 hours Tour", "3.30 hours Tour (with Cubatão Cemetery)", "3.30 hours Tour (Local attractions)", "5 hours Tour (Cemetery + attractions)"],
    requirePassport: true,
    extraQuestions: []
  },
  "São Paulo": {
    tours: ["4 hours tour by car", "5 hours tour (public transport)", "2 hours walking tour (Bom Retiro)"],
    requirePassport: true,
    extraQuestions: []
  },
  "Recife": {
    tours: ["3 hours tour", "4 hours tour (visiting Olinda)"],
    requirePassport: true,
    extraQuestions: []
  },
  "Santiago de Chile": {
    tours: ["Half Day (4-5 hrs)", "Full Day (6-7 hrs)", "San Antonio Cruise Pick-up + Tour + SCL Drop-off"],
    requirePassport: true,
    extraQuestions: [
      { id: "airport_transfer", label: "Start/End at SCL Airport? (Extra cost applies)" },
      { id: "port_transfer", label: "Pick up/Drop off at Valparaiso or San Antonio cruise dock? (Extra cost)" }
    ]
  },
  "Montevideo": {
    tours: ["Half Day (4 hrs)", "Extended Tour (6 hrs)", "Full Day (8 hrs - Jewish + Highlights)"],
    requirePassport: true,
    extraQuestions: []
  },
  "Punta del Este": {
    tours: ["Jewish Tour (4 hrs)"],
    requirePassport: true,
    extraQuestions: [
      { id: "casapueblo", label: "Add inside visit to Casapueblo? (+ USD 20/pax)" }
    ]
  },
  "Lima": {
    tours: ["Half-day Tour (4 hrs)", "Shorter Tour (3 hrs)"],
    requirePassport: true,
    extraQuestions: [
      { id: "kosher_food", label: "Are you interested in Kosher Lunch-Boxes delivery?" },
      { id: "callao_port", label: "Pick up from the cruise port in Callao? (+ USD 40/60)" }
    ]
  },
  "Bogota": {
    tours: ["Jewish Tour (3 hrs)"],
    requirePassport: true,
    extraQuestions: []
  },
  "Cartagena": {
    tours: ["Jewish Tour (3 hrs)"],
    requirePassport: true,
    extraQuestions: []
  },
  "Puerto Rico": {
    tours: ["Half Day (2.30 hrs)", "Full Day (including tourist attractions)"],
    requirePassport: false,
    extraQuestions: []
  }
};

export async function getServerSideProps(context) {
  const { uuid } = context.params;
  try {
    const cleanUuid = uuid.trim();
    const [rows] = await db.promise().query(
      'SELECT destination_name FROM bookings_pipeline WHERE booking_uuid = ? OR id = ?',
      [cleanUuid, cleanUuid]
    );

    if (rows.length === 0) {
      return { props: { uuid: cleanUuid, destinationCity: "Unknown" } }; 
    }
    return {
      props: {
        uuid: cleanUuid,
        destinationCity: rows[0].destination_name || "Unknown",
      },
    };
  } catch (error) {
    return { props: { uuid: "ERROR", destinationCity: "Connection Error" } };
  }
}

export default function SecurityPortal({ uuid, destinationCity }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cityKey = Object.keys(cityConfig).find(
    key => key.toLowerCase() === destinationCity.trim().toLowerCase()
  );
  const config = cityConfig[cityKey] || { tours: ["Standard Tour", "Half Day", "Full Day"], requirePassport: true, extraQuestions: [] };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    formData.append('booking_uuid', uuid);

    try {
      const response = await fetch('/api/security/submit', { method: 'POST', body: formData });
      if (response.ok) alert('✅ Information sent successfully!');
      else alert('❌ Error sending information.');
    } catch (error) {
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Jewish Tours - Trip Details & Security</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Complete your travel details for <b>{destinationCity}</b>.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* LOGÍSTICA */}
        <fieldset style={{ padding: '15px', border: '1px solid #3498db', borderRadius: '5px', backgroundColor: '#ebf5fb' }}>
          <legend style={{ fontWeight: 'bold', color: '#2980b9' }}>1. Tour Preferences</legend>
          <select name="tour_type" className="form-control mb-2" required>
            <option value="">Select a tour...</option>
            {config.tours.map(tour => <option key={tour} value={tour}>{tour}</option>)}
          </select>
          <label style={{fontSize: '12px'}}>Suggested Starting Time:</label>
          <input type="time" name="start_time" className="form-control mb-2" required />
          <input type="text" name="hotel_name" placeholder="Hotel Name / Pick-up Address (Write 'Cruise' if not applicable)" className="form-control mb-2" required />
          <input type="text" name="dropoff_location" placeholder="Drop-off Address (If different from pick-up)" className="form-control" />
          {config.extraQuestions.map(q => (
            <div className="form-check mt-3" key={q.id}>
              <input type="checkbox" name={`extra_${q.id}`} id={q.id} className="form-check-input" />
              <label htmlFor={q.id} className="form-check-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>{q.label}</label>
            </div>
          ))}
        </fieldset>

        {/* PASAJEROS Y VIAJE */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>2. Passengers & Travel Info</legend>
          <input type="text" name="passengers_names" placeholder="Full Names of all passengers" className="form-control mb-2" required />
          <input type="text" name="passengers_ages" placeholder="Ages (e.g. 45, 42)" className="form-control mb-2" required />
          
          <select name="travel_type" className="form-control mb-2" required>
            <option value="">Arriving by Flight or Cruise?</option>
            <option value="Flight">Flight</option>
            <option value="Cruise">Cruise Ship</option>
          </select>
          <div style={{display: 'flex', gap: '10px'}} className="mb-2">
            <div style={{flex: 1}}><label style={{fontSize: '12px'}}>Arrival Date:</label><input type="date" name="arrival_date" className="form-control" required/></div>
            <div style={{flex: 1}}><label style={{fontSize: '12px'}}>Departure Date:</label><input type="date" name="departure_date" className="form-control" required/></div>
          </div>
          
          <input type="text" name="phone_number" placeholder="Phone Number (WhatsApp)" className="form-control mb-2" required />
          <input type="text" name="home_address" placeholder="City & Country where you live" className="form-control mb-2" required />
          <input type="text" name="profession" placeholder="Profession / Occupation" className="form-control mb-2" required />
          
          <div className="form-check mt-2">
            <input type="checkbox" name="difficulty_walking" id="difficulty_walking" className="form-check-input" />
            <label htmlFor="difficulty_walking" className="form-check-label text-danger" style={{ fontSize: '13px' }}>Does any participant have difficulty walking?</label>
          </div>
        </fieldset>

        {/* COMUNIDAD Y SEGURIDAD */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>3. Community Background</legend>
          <input type="text" name="community_name" placeholder="Name of your home Jewish Community/Synagogue" className="form-control mb-2" required />
          <select name="religious_denomination" className="form-control mb-2" required>
            <option value="">Denomination...</option>
            <option value="Orthodox">Orthodox</option>
            <option value="Conservative">Conservative</option>
            <option value="Reform">Reform</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" name="rabbi_name" placeholder="Name of your Rabbi or referent" className="form-control mb-2" required />
          <input type="text" name="visit_reason" placeholder="Reason for your visit (Tourism, Business, Family)" className="form-control mb-2" required />
          <input type="text" name="other_institutions" placeholder="Other local institutions you plan to visit (if any)" className="form-control mb-2" />
          <div className="form-check mt-2">
            <input type="checkbox" name="knows_someone" id="knows_someone" className="form-check-input" />
            <label htmlFor="knows_someone" className="form-check-label" style={{ fontSize: '13px' }}>Do you know anyone in the local community?</label>
          </div>
        </fieldset>

        {/* PASAPORTES (FOTOS Y NÚMEROS) */}
        {config.requirePassport && (
          <fieldset style={{ padding: '15px', border: '1px solid #e74c3c', borderRadius: '5px', backgroundColor: '#fdf3f2' }}>
            <legend style={{ fontWeight: 'bold', color: '#c0392b' }}>4. Passport Information</legend>
            <input type="text" name="passengers_passports" placeholder="Passport Numbers (comma separated)" className="form-control mb-2" required />
            <p style={{ fontSize: '12px', color: '#555' }}>Upload a clear photo of the passport data page for all passengers.</p>
            <input type="file" name="passport_files" accept="image/*,application/pdf" multiple required className="form-control" />
          </fieldset>
        )}

        <button type="submit" disabled={isSubmitting} style={{ padding: '15px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {isSubmitting ? 'Sending...' : 'Submit Security Information'}
        </button>
      </form>
    </div>
  );
}