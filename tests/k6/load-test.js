import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

// Configuración de la prueba de carga
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Rampa hasta 10 usuarios en 30s
    { duration: '1m', target: 10 },   // Mantener 10 usuarios por 1 minuto
    { duration: '30s', target: 50 },  // Rampa hasta 50 usuarios en 30s
    { duration: '1m', target: 50 },   // Mantener 50 usuarios por 1 minuto
    { duration: '30s', target: 0 },   // Reducir a 0 usuarios en 30s
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% de las peticiones deben ser <500ms
    'errors': ['rate<0.1'],             // Tasa de error <10%
    'http_req_failed': ['rate<0.1'],    // Tasa de fallo <10%
  },
};

const BASE_URL = 'http://localhost:3000';

// Función principal de la prueba
export default function () {
  const email = `test_${Date.now()}_${__VU}_${__ITER}@example.com`;
  const password = 'Test1234';

  // 1. Registro de usuario
  let registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  let registerCheck = check(registerRes, {
    'Register: status 201': (r) => r.status === 201,
    'Register: tiene token': (r) => r.json('token') !== undefined,
  });
  errorRate.add(!registerCheck);

  sleep(1);

  // 2. Login de usuario
  let loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  let loginCheck = check(loginRes, {
    'Login: status 200': (r) => r.status === 200,
    'Login: tiene token': (r) => r.json('token') !== undefined,
  });
  errorRate.add(!loginCheck);

  // Extraer el token JWT
  const token = loginRes.json('token');

  sleep(1);

  // 3. Crear reserva (solo si el login fue exitoso)
  if (token) {
    let reservaRes = http.post(
      `${BASE_URL}/api/reservas`,
      JSON.stringify({
        fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
        hora: '14:00',
        numeroPersonas: 4,
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

    let reservaCheck = check(reservaRes, {
      'Reserva: status 201': (r) => r.status === 201,
      'Reserva: creada exitosamente': (r) => r.json('message') !== undefined || r.json('reserva') !== undefined,
    });
    errorRate.add(!reservaCheck);
  }

  sleep(1);
}

// Función de configuración (se ejecuta una vez al inicio)
export function setup() {
  console.log('🚀 Iniciando pruebas de carga con k6...');
  console.log(`📊 Objetivo: ${BASE_URL}`);
}

// Función de teardown (se ejecuta una vez al final)
export function teardown(data) {
  console.log('✅ Pruebas de carga completadas');
}
