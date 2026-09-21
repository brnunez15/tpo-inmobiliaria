# TPO 2026 - Marketplace inmobiliario

Template fullstack para el Trabajo Practico Integrador de Aplicaciones Interactivas.

## Estructura

```text
back/   API REST, TypeScript, Express y TypeORM
front/  Aplicacion cliente, React, TypeScript y Vite
```

## Requisitos

- Node.js 22+
- PostgreSQL 16+

## Inicio rapido

```bash
cd back
cp .env.example .env
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000` y su health check en
`GET /health`.

El frontend se instala y ejecuta desde `front/` con `npm install` y `npm run dev`.

## Alcance del template

El backend incluye la configuracion de persistencia, el modelo inicial del
dominio y una ruta de salud. Las migraciones, repositorios, servicios,
controladores y rutas de negocio quedan organizados para que cada equipo los
complete durante el cuatrimestre.
