import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Configuración para prueba de estrés
export const options = {
  stages: [
    { duration: '2m', target: 200 },  // Rampa a 200 usuarios en 2 minutos
    { duration: '3m', target: 300 },  // Mantener 300 usuarios por 3 minutos
    { duration: '2m', target: 0 },    // Reducir a 0 usuarios
  ],
  thresholds: {
    'http_req_duration': ['p(95)<800'], // 95% de las peticiones <800ms
    'errors': ['rate<0.2'],             // Tasa de error <20%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const email = `stress_${Date.now()}_${__VU}_${__ITER}@example.com`;
  const password = 'Test1234';

  // Registro
  let registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  errorRate.add(!check(registerRes, {
    'Register: status 201': (r) => r.status === 201,
  }));

  sleep(0.5);

  // Login
  let loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  errorRate.add(!check(loginRes, {
    'Login: status 200': (r) => r.status === 200,
  }));

  const token = loginRes.json('token');

  sleep(0.5);

  // Crear reserva
  if (token) {
    let reservaRes = http.post(
      `${BASE_URL}/api/reservas`,
      JSON.stringify({
        fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        hora: `${10 + Math.floor(Math.random() * 8)}:00`,
        numeroPersonas: Math.floor(Math.random() * 8) + 1,
        nombreCliente: `Cliente ${__VU}`,
        telefonoCliente: `09${Math.floor(Math.random() * 100000000)}`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    errorRate.add(!check(reservaRes, {
      'Reserva: status 201': (r) => r.status === 201,
    }));
  }

  sleep(0.5);
}

export function setup() {
  console.log('🔥 Iniciando prueba de estrés...');
}

export function teardown() {
  console.log('✅ Prueba de estrés completada');
}
