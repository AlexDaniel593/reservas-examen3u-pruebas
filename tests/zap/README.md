# OWASP ZAP - Contexto para Reservas API

## Configuración Manual (Recomendado)

### 1. Crear el Contexto

1. Abrir OWASP ZAP
2. Click derecho en "Default Context" en el panel de Contextos → `New Context`
3. Nombrar el contexto: `Reservas API`

### 2. Configurar Include/Exclude URLs

1. Click derecho en el contexto `Reservas API` → `Edit`
2. En la pestaña `Include in Context`:
    - Añadir regex: `http://(localhost|127\.0\.0\.1):3000/.*`
3. En la pestaña `Exclude from Context` (opcional):
   - Añadir regex: `http://localhost:3000/(favicon\.ico|static|assets)/.*`

### 3. Configurar Autenticación

Si prefieres autenticación manual sin scripts:

1. En el contexto → pestaña `Authentication`
2. Seleccionar `Form-based`
3. Login URL: `http://localhost:3000/api/auth/login`
4. Logged In Indicator (regex): `\Q{"token"\E`
5. Logged Out Indicator (regex): `\Q"error"\E`

**Credenciales de prueba:**
- Email: `test@example.com`
- Password: `password123`

### 4. Habilitar Session Management para JWT

1. En el contexto → pestaña `Session Management`
2. Seleccionar `HTTP Authentication Session Management`


## Ejecutar Escaneo de Seguridad

1. Asegúrate de que el servidor esté corriendo: `npm start`
2. Verifica en el navegador que la API responde (GET): `http://127.0.0.1:3000/health`
3. En ZAP, selecciona el contexto `Reservas API`
4. Click derecho en `http://127.0.0.1:3000` → `Attack` → `Spider` (opcional)
5. Click derecho en `http://127.0.0.1:3000` → `Attack` → `Active Scan`
4. Seleccionar el usuario `testuser`
5. Iniciar escaneo

## Endpoints de la API

- `POST /api/auth/register` - Registro (público)
- `POST /api/auth/login` - Login (público, retorna JWT)
- `POST /api/reservas` - Crear reserva (requiere autenticación JWT)
