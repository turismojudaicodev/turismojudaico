export function calculateBookingPrice(booking) {
  const { destination_name, tour_option, pax_adults, extra_amia, extra_airport, extra_port, extra_casapueblo, extra_callao } = booking;
  const pax = parseInt(pax_adults) || 1;
  let baseTotal = 0;
  let extrasTotal = 0;
  const tour = tour_option ? tour_option.toLowerCase() : '';

  switch (destination_name) {
    case 'Buenos Aires':
      if (tour.includes('walking')) {
        if (pax === 1) baseTotal = 140;
        else if (pax === 2) baseTotal = 160;
        else if (pax >= 3 && pax <= 5) baseTotal = 280;
        else if (pax >= 6 && pax <= 8) baseTotal = 400;
        else baseTotal = 500;
      } else if (tour.includes('holiday') || tour.includes('sunday')) {
        if (pax <= 2) baseTotal = 120 * pax;
        else if (pax >= 3 && pax <= 5) baseTotal = 105 * pax;
        else baseTotal = 90 * pax;
      } else if (tour.includes('4 hrs') || tour.includes('traditional')) {
        if (pax === 1) baseTotal = 270;
        else if (pax === 2) baseTotal = 155 * pax;
        else if (pax >= 3 && pax <= 5) baseTotal = 140 * pax;
        else if (pax >= 6 && pax <= 8) baseTotal = 120 * pax;
        else baseTotal = 110 * pax;
      } else if (tour.includes('6 hrs')) {
        if (pax <= 2) baseTotal = 220 * pax;
        else if (pax >= 3 && pax <= 5) baseTotal = 200 * pax;
        else if (pax >= 6 && pax <= 8) baseTotal = 170 * pax;
        else baseTotal = 145 * pax;
      } else if (tour.includes('8 hrs')) {
        if (pax <= 2) baseTotal = 285 * pax;
        else if (pax >= 3 && pax <= 5) baseTotal = 255 * pax;
        else if (pax >= 6 && pax <= 8) baseTotal = 220 * pax;
        else baseTotal = 200 * pax;
      }
      if (extra_amia) extrasTotal += (20 * pax);
      break;

    case 'Tour Judaico Rio de Janeiro  ':
      if (tour.includes('walking')) {
        if (pax === 1) baseTotal = 150;
        else if (pax === 2) baseTotal = 180;
        else if (pax <= 4) baseTotal = 300;
        else baseTotal = 400;
      } else if (tour.includes('3 hrs')) {
        baseTotal = 210 * pax;
      } else if (tour.includes('4 hrs') || tour.includes('half')) {
        if (pax === 1) baseTotal = 250;
        else if (pax === 2) baseTotal = 280; 
        else if (pax <= 4) baseTotal = 125 * pax;
        else if (pax <= 6) baseTotal = 115 * pax;
        else baseTotal = 75 * pax;
      } else if (tour.includes('6 hrs')) {
        if (pax <= 2) baseTotal = 360;
        else if (pax <= 4) baseTotal = 170 * pax;
        else baseTotal = 160 * pax;
      } else if (tour.includes('8 hrs') || tour.includes('full')) {
        if (pax <= 2) baseTotal = 440;
        else if (pax <= 4) baseTotal = 210 * pax;
        else if (pax <= 6) baseTotal = 200 * pax;
        else baseTotal = 130 * pax;
      }
      if (extra_airport) extrasTotal += (pax <= 3 ? 70 : 100);
      break;

    case 'Santiago de Chile':
      if (tour.includes('san antonio') && tour.includes('scl')) {
        if (pax <= 2) baseTotal = 350 * pax;
        else baseTotal = 300 * pax;
      } else if (tour.includes('half day') || tour.includes('4')) {
        if (pax === 1) baseTotal = 220;
        else if (pax === 2) baseTotal = 155 * pax;
        else if (pax === 3) baseTotal = 140 * pax;
        else baseTotal = 130 * pax;
      } else if (tour.includes('full day') || tour.includes('6')) {
        if (pax === 1) baseTotal = 340;
        else if (pax === 2) baseTotal = 225 * pax;
        else if (pax === 3) baseTotal = 210 * pax;
        else baseTotal = 200 * pax;
      }
      if (extra_airport) extrasTotal += (pax <= 2 ? 70 : 100);
      if (extra_port) extrasTotal += (pax <= 2 ? 180 : 240);
      break;

    case 'Montevideo':
      if (tour.includes('4 hrs') || tour.includes('half')) {
        if (pax === 1) baseTotal = 250;
        else if (pax === 2) baseTotal = 155 * pax;
        else if (pax === 3) baseTotal = 135 * pax;
        else if (pax === 4) baseTotal = 120 * pax;
        else if (pax === 5) baseTotal = 110 * pax;
        else if (pax === 6) baseTotal = 105 * pax;
        else baseTotal = 95 * pax;
      } else if (tour.includes('6 hrs')) {
        if (pax === 1) baseTotal = 335;
        else if (pax === 2) baseTotal = 200 * pax;
        else if (pax === 3) baseTotal = 165 * pax;
        else if (pax === 4) baseTotal = 145 * pax;
        else if (pax === 5) baseTotal = 135 * pax;
        else if (pax === 6) baseTotal = 120 * pax;
        else baseTotal = 115 * pax;
      } else if (tour.includes('8 hrs') || tour.includes('full')) {
        if (pax === 1) baseTotal = 440;
        else if (pax === 2) baseTotal = 250 * pax;
        else if (pax === 3) baseTotal = 200 * pax;
        else if (pax === 4) baseTotal = 170 * pax;
        else if (pax === 5) baseTotal = 150 * pax;
        else if (pax === 6) baseTotal = 145 * pax;
        else baseTotal = 135 * pax;
      }
      break;

    case 'Punta del Este':
      if (pax === 1) baseTotal = 300;
      else if (pax === 2) baseTotal = 250 * pax;
      else if (pax <= 4) baseTotal = 150 * pax;
      else if (pax <= 6) baseTotal = 110 * pax;
      else baseTotal = 105 * pax;
      if (extra_casapueblo) extrasTotal += (20 * pax);
      break;

    case 'Lima':
      if (tour.includes('4 hrs') || tour.includes('half')) {
        if (pax === 1) baseTotal = 220;
        else if (pax <= 3) baseTotal = 135 * pax;
        else if (pax <= 5) baseTotal = 130 * pax;
        else if (pax <= 7) baseTotal = 125 * pax;
        else baseTotal = 110 * pax;
      } else if (tour.includes('3 hrs') || tour.includes('shorter')) {
        if (pax === 1) baseTotal = 180;
        else if (pax <= 3) baseTotal = 110 * pax;
        else if (pax <= 5) baseTotal = 105 * pax;
        else if (pax <= 7) baseTotal = 100 * pax;
        else baseTotal = 90 * pax;
      }
      if (extra_callao) extrasTotal += 60; 
      break;

    case 'Panama':
      if (tour.includes('afternoon') && pax >= 2) baseTotal = 150 * pax;
      else if (tour.includes('shorter') || tour.includes('sunday')) {
        if (pax <= 3) baseTotal = 110 * pax;
        else baseTotal = 90 * pax;
      } else {
        baseTotal = 90 * pax;
      }
      if (extra_port) extrasTotal += (30 * pax);
      break;

    case 'Bogota':
      if (pax === 1) baseTotal = 180;
      else if (pax === 2) baseTotal = 220;
      else if (pax === 3) baseTotal = 300;
      else if (pax === 4) baseTotal = 400;
      else if (pax >= 6) baseTotal = 570;
      else baseTotal = 100 * pax; 
      break;

    case 'Cartagena':
      if (pax === 1) baseTotal = 150;
      else if (pax <= 3) baseTotal = 100 * pax;
      else baseTotal = 85 * pax;
      break;

    case 'Puerto Rico':
      if (tour.includes('full')) baseTotal = 220 * pax;
      else baseTotal = 120 * pax;
      break;

    case 'Santos':
      if (tour.includes('2 hours')) {
        if (pax <= 2) baseTotal = 150 * pax;
        else if (pax <= 4) baseTotal = 110 * pax;
        else baseTotal = 90 * pax;
      } else if (tour.includes('3.30 hours')) {
        if (pax <= 2) baseTotal = 180 * pax;
        else if (pax <= 4) baseTotal = 135 * pax;
        else baseTotal = 110 * pax;
      } else if (tour.includes('5 hours')) {
        if (pax <= 2) baseTotal = 225 * pax;
        else if (pax <= 4) baseTotal = 160 * pax;
        else baseTotal = 130 * pax;
      }
      break;

    case 'São Paulo':
      if (tour.includes('walking')) {
        if (pax <= 2) baseTotal = 65 * pax;
        else if (pax <= 4) baseTotal = 55 * pax;
        else baseTotal = 45 * pax;
      } else if (tour.includes('5 hours') || tour.includes('public')) {
        if (pax <= 2) baseTotal = 125 * pax;
        else if (pax <= 4) baseTotal = 120 * pax;
        else baseTotal = 110 * pax;
      } else if (tour.includes('4 hours') || tour.includes('car')) {
        if (pax <= 2) baseTotal = 150 * pax;
        else if (pax <= 4) baseTotal = 140 * pax;
        else baseTotal = 130 * pax;
      }
      break;

    case 'Recife':
      if (tour.includes('3 hours')) baseTotal = 120 * pax;
      else if (tour.includes('4 hours')) baseTotal = 150 * pax;
      break;

    default:
      baseTotal = 0;
  }

  return {
    pax,
    baseTotal,
    extrasTotal,
    finalTotal: baseTotal + extrasTotal
  };
}