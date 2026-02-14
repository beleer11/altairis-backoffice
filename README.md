# Altairis Backoffice - Sistema de Gestión Hotelera

Sistema fullstack para la gestión de hoteles, habitaciones, inventario y reservas desarrollado para **Viajes Altairis**.

## Descripción

Backoffice web que permite al equipo de Altairis:

- Administrar información de hoteles y tipos de habitación
- Gestionar disponibilidad e inventario
- Controlar reservas y consultar actividad operativa

Desarrollado como MVP para demostración comercial.

---

## Stack Tecnológico

### Backend

- **.NET 9** - Framework principal
- **ASP.NET Core Web API** - API REST
- **Entity Framework Core** - ORM
- **PostgreSQL 16** - Base de datos
- **Swagger/OpenAPI** - Documentación de API

### Frontend

- **Next.js 14** (App Router) - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **TanStack Query** - Gestión de estado del servidor
- **Recharts** - Visualización de datos
- **Axios** - Cliente HTTP

### Infraestructura

- **Docker** & **Docker Compose** - Contenedorización

---

## Arquitectura

```
Frontend (Next.js)  →  Backend API (.NET)  →  PostgreSQL
    :3000                   :5000                 :5432
```

**Patrón Backend**: Repository Pattern + Dependency Injection  
**Arquitectura Frontend**: Component-based + Custom Hooks + API Layer

---

## Requisitos

- Docker Desktop >= 20.10
- Docker Compose >= 2.0

---

## Instalación y Ejecución

### Con Docker Compose (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd altairis-backoffice

# Levantar todos los servicios
docker-compose up --build
```

**Servicios disponibles:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger/index.html
- PostgreSQL: localhost:5432

La base de datos se inicializa automáticamente con datos de ejemplo:

- 3 hoteles
- 7 tipos de habitación
- 630 registros de inventario
- 3 reservas

### Desarrollo Local (Opcional)

**Backend:**

```bash
cd backend/AltairisBackoffice.API
dotnet restore
dotnet run
# Disponible en http://localhost:5000
```

**Frontend:**

```bash
cd frontend
npm install
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select table dropdown-menu dialog form badge separator skeleton toast tabs avatar
npm run dev
# Disponible en http://localhost:3000
```

---

## Funcionalidades

### Gestión de Hoteles

- CRUD completo de hoteles
- Búsqueda por nombre, ciudad, país y categoría
- Gestión de tipos de habitación por hotel

### Gestión de Inventario

- Calendario de disponibilidad (30 días)
- Actualización de precios por fecha
- Generación automática de inventario
- Métricas en tiempo real (disponibilidad, ocupación, ingresos)

### Gestión de Reservas

- CRUD completo de reservas
- Estados: Pendiente, Confirmada, Check-in, Check-out, Cancelada, No Show
- Búsqueda por referencia, email o rango de fechas
- Cálculo de ocupación e ingresos

### Dashboard

- Estadísticas clave (hoteles, habitaciones, reservas, ingresos)
- Gráficos de ocupación mensual
- Tendencias de ingresos
- Lista de últimas reservas

---

## Documentación API

La documentación completa e interactiva está disponible en:

**Swagger UI**: http://localhost:5000/swagger/index.html

### Endpoints Principales

**Hotels**

- `GET /api/Hotels` - Listar hoteles (paginado)
- `GET /api/Hotels/{id}` - Obtener hotel por ID
- `GET /api/Hotels/search` - Buscar hoteles
- `POST /api/Hotels` - Crear hotel
- `PUT /api/Hotels/{id}` - Actualizar hotel
- `DELETE /api/Hotels/{id}` - Eliminar hotel

**RoomTypes**

- `GET /api/RoomTypes` - Listar tipos de habitación
- `GET /api/RoomTypes/hotel/{hotelId}` - Obtener por hotel
- `POST /api/RoomTypes` - Crear tipo
- `PUT /api/RoomTypes/{id}` - Actualizar tipo
- `DELETE /api/RoomTypes/{id}` - Eliminar tipo

**Inventory**

- `GET /api/Inventory/roomtype/{id}` - Obtener inventario
- `POST /api/Inventory/update` - Actualizar inventario
- `POST /api/Inventory/generate` - Generar inventario

**Bookings**

- `GET /api/Bookings` - Listar reservas
- `GET /api/Bookings/{id}` - Obtener reserva
- `GET /api/Bookings/reference/{ref}` - Buscar por referencia
- `GET /api/Bookings/email/{email}` - Buscar por email
- `GET /api/Bookings/occupancy/{hotelId}` - Obtener ocupación
- `POST /api/Bookings` - Crear reserva
- `PUT /api/Bookings/{id}` - Actualizar reserva
- `DELETE /api/Bookings/{id}` - Eliminar reserva

---

## Estructura del Proyecto

```
altairis-backoffice/
├── backend/
│   ├── AltairisBackoffice.API/          # API REST
│   ├── AltairisBackoffice.Core/         # Entidades e interfaces
│   └── AltairisBackoffice.Infrastructure/ # Repositorios y acceso a datos
├── frontend/
│   ├── app/                             # Pages (App Router)
│   ├── components/                      # Componentes reutilizables
│   ├── hooks/                           # Custom hooks
│   └── lib/                             # API client y utilidades
└── docker-compose.yml
```

---

## Modelo de Datos

```
Hotels (1) ──── (N) RoomTypes (1) ──── (N) Inventory
                      │
                      │
                     (N)
                      │
                  Bookings
```

**Tablas:**

- `Hotels` - Información de hoteles
- `RoomTypes` - Tipos de habitación por hotel
- `RoomInventories` - Disponibilidad y precios por fecha
- `Bookings` - Reservas

---

## Configuración

### Variables de Entorno

**Backend** (`appsettings.json`):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Database=altairis;Username=altairis_user;Password=dev123"
  }
}
```

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### CORS

El backend está configurado para permitir peticiones desde:

- `http://localhost:3000` (desarrollo)
- `http://frontend:3000` (Docker)

---

## Notas Técnicas

### Backend

- Patrón Repository para acceso a datos
- Inyección de dependencias nativa de .NET
- Inicialización automática de base de datos con `DbInitializer`
- Validación de modelos con Data Annotations

### Frontend

- App Router de Next.js 14
- Custom hooks para cada entidad (hotels, bookings, rooms)
- React Query para cache y sincronización
- Componentes reutilizables con shadcn/ui
- Type-safe con TypeScript

### Base de Datos

- Relaciones definidas con EF Core
- Índices en campos clave (fechas, referencias)
- Inicialización automática con datos de ejemplo

---

## Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Eliminar volúmenes (resetear BD)
docker-compose down -v
```

---

## Desarrollado para

**Viajes Altairis** - Prueba Técnica MVP  
Sistema de gestión hotelera B2B

---

## Licencia

Este proyecto es un MVP desarrollado con fines demostrativos.
