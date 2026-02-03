# Pruebas de Carga con k6

Este directorio contiene las pruebas de carga para la API de Reservas utilizando k6.

## Instalación de k6

### Windows (usando Chocolatey)
```bash
choco install k6
```

### Windows (usando winget)
```bash
winget install k6
```

### Alternativa: Descarga directa
Descarga desde: https://k6.io/docs/get-started/installation/

## Tipos de Pruebas

### 1. Smoke Test (Prueba de Humo)
**Archivo:** `smoke-test.js`  
**Propósito:** Verificar que el sistema funciona correctamente con carga mínima.  
**Usuarios:** 1 usuario virtual durante 30 segundos

```bash
k6 run tests/k6/smoke-test.js
```

### 2. Load Test (Prueba de Carga)
**Archivo:** `load-test.js`  
**Propósito:** Evaluar el rendimiento del sistema bajo carga esperada.  
**Usuarios:** Incrementa de 10 a 50 usuarios virtuales

```bash
k6 run tests/k6/load-test.js
```

### 3. Stress Test (Prueba de Estrés)
**Archivo:** `stress-test.js`  
**Propósito:** Determinar los límites del sistema.  
**Usuarios:** Incrementa hasta 300 usuarios virtuales

```bash
k6 run tests/k6/stress-test.js
```

## Ejecutar con Resultados en HTML

```bash
k6 run --out json=results.json tests/k6/load-test.js
```

## Ejecutar con Métricas en Tiempo Real

```bash
k6 run --out json=results.json tests/k6/load-test.js --summary-export=summary.json
```

## Prerrequisitos

Antes de ejecutar las pruebas, asegúrate de que:
1. El servidor esté ejecutándose en `http://localhost:3000`
2. La base de datos esté disponible
3. k6 esté instalado

## Iniciar el Servidor

```bash
npm start
```

## Métricas Importantes

- **http_req_duration**: Tiempo de respuesta de las peticiones
- **http_req_failed**: Tasa de fallos de las peticiones
- **errors**: Tasa de errores personalizados
- **checks**: Porcentaje de validaciones exitosas

## Umbrales Configurados

### Load Test
- 95% de peticiones < 500ms
- Tasa de error < 10%

### Stress Test
- 95% de peticiones < 800ms
- Tasa de error < 20%

## Escenarios de Prueba

Cada prueba ejecuta el siguiente flujo:
1. **Registro** de nuevo usuario
2. **Login** con las credenciales
3. **Creación de reserva** usando el token JWT
