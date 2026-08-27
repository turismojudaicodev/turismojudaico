import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SecurityPortal() {
  const router = useRouter();
  const { uuid } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Empaquetamos todos los textos y las fotos
    const formData = new FormData(e.target);
    formData.append('booking_uuid', uuid); // Le inyectamos el ID oculto de la URL

    try {
      const response = await fetch('/api/security/submit', {
        method: 'POST',
        body: formData, // Al mandar FormData, el navegador entiende que van fotos
      });

      if (response.ok) {
        alert('✅ ¡Security information sent successfully! / Información enviada.');
        // Aquí podrías redirigirlos a una página de "Gracias"
      } else {
        alert('❌ Error sending information. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!uuid) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Jewish Tours - Security Clearance</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
        Please fill out this form for all passengers. Your data is strictly confidential.
      </p>

     <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* --- DATOS GENERALES --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>Passengers Information</legend>
          <input type="text" name="passengers_names" placeholder="Full Names (e.g. John Doe, Jane Doe)" className="form-control mb-2" required />
          <input type="text" name="passengers_ages" placeholder="Ages (e.g. 45, 42)" className="form-control mb-2" required />
          <input type="text" name="passengers_passports" placeholder="Passport Numbers" className="form-control mb-2" required />
          <input type="text" name="phone_number" placeholder="Phone Number" className="form-control mb-2" required />
          <input type="text" name="home_address" placeholder="Home address" className="form-control mb-2" required />
          <input type="text" name="profession" placeholder="Profession" className="form-control" required />
        </fieldset>

        {/* --- LOGÍSTICA --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>Travel Logistics</legend>
          <select name="travel_type" className="form-control mb-2" required>
            <option value="">Arriving by...</option>
            <option value="Flight">Flight</option>
            <option value="Cruise">Cruise Ship</option>
          </select>
          <div style={{ display: 'flex', gap: '10px' }} className="mb-2">
            <input type="date" name="arrival_date" className="form-control" required title="Arrival Date" />
            <input type="date" name="departure_date" className="form-control" required title="Departure Date" />
          </div>
          <input type="text" name="hotel_name" placeholder="Hotel Name / Address during stay" className="form-control" required />
        </fieldset>

        {/* --- DATOS COMUNITARIOS --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <legend style={{ fontWeight: 'bold' }}>Community Background</legend>
          <input type="text" name="community_name" placeholder="Name of your home Jewish Community" className="form-control mb-2" />
          <select name="religious_denomination" className="form-control mb-2">
            <option value="">Denomination (Optional)</option>
            <option value="Orthodox">Orthodox</option>
            <option value="Conservative">Conservative</option>
            <option value="Reform">Reform</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" name="rabbi_name" placeholder="Name of Rabbi or Referent" className="form-control mb-2" />
          <textarea name="visit_reason" placeholder="Reason for your visit to this country" className="form-control mb-2" rows="2"></textarea>
          <textarea name="other_institutions" placeholder="Other Institutions you will visit during your stay?" className="form-control mb-2" rows="2"></textarea>
          
          <div className="form-check mt-2">
            <input type="checkbox" name="knows_someone" id="knows_someone" className="form-check-input" />
            <label htmlFor="knows_someone" className="form-check-label text-muted" style={{ fontSize: '14px' }}>
              Do you know somebody from the Jewish community in the city you are visiting?
            </label>
          </div>
        </fieldset>

        {/* --- 📷 LA MAGIA: SUBIDA DE PASAPORTES --- */}
        <fieldset style={{ padding: '15px', border: '1px solid #e74c3c', borderRadius: '5px', backgroundColor: '#fdf3f2' }}>
          <legend style={{ fontWeight: 'bold', color: '#c0392b' }}>Passport Upload</legend>
          <p style={{ fontSize: '12px', color: '#555' }}>Please upload a clear photo of the passport data page for all passengers.</p>
          <input type="file" name="passport_files" accept="image/*,application/pdf" multiple required className="form-control" />
        </fieldset>

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