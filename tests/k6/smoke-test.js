import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración para prueba de humo (smoke test)
export const options = {
  vus: 1, // 1 usuario virtual
  duration: '30s', // Durante 30 segundos
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'Test1234';

  // Registro
  let registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(registerRes, {
    'Register OK': (r) => r.status === 201,
  });

  sleep(1);

  // Login
  let loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'Login OK': (r) => r.status === 200,
  });

  const token = loginRes.json('token');

  sleep(1);

  // Crear reserva
  if (token) {
    let reservaRes = http.post(
      `${BASE_URL}/api/reservas`,
      JSON.stringify({
        fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        hora: '14:00',
        numeroPersonas: 4,
        nombreCliente: 'Test Cliente',
        telefonoCliente: '0987654321',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    check(reservaRes, {
      'Reserva OK': (r) => r.status === 201,
    });
  }

  sleep(1);
}
