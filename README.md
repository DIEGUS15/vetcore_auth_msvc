# VetCore - Auth Service

Microservicio de autenticación y autorización para el sistema VetCore. Maneja el registro de usuarios, login, validación de tokens JWT y gestión de roles.

## Características

- Autenticación basada en JWT (JSON Web Tokens)
- Sistema de roles (Admin, Veterinarian, Receptionist)
- Hashing seguro de contraseñas con bcrypt
- Base de datos MySQL dedicada
- Seeders automáticos para roles predeterminados
- Middleware de protección de rutas

## Tecnologías

- Node.js + Express
- Sequelize ORM
- MySQL 8.0
- JWT (jsonwebtoken)
- bcrypt
- dotenv

## Estructura del Proyecto

```
vetcore_auth_msvc/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Login y registro
│   │   └── userController.js    # CRUD de usuarios
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verificación de JWT
│   │   └── roleMiddleware.js    # Verificación de roles
│   ├── models/
│   │   ├── User.js              # Modelo de usuarios
│   │   ├── Role.js              # Modelo de roles
│   │   └── associations.js      # Relaciones entre modelos
│   ├── routes/
│   │   ├── authRoutes.js        # Rutas de autenticación
│   │   └── userRoutes.js        # Rutas de usuarios
│   └── seeders/
│       └── roleSeeder.js        # Seeder de roles
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de variables
├── index.js                     # Punto de entrada
├── Dockerfile                   # Para construcción de imagen
├── docker-compose.yml           # Para ejecución individual
└── package.json
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vetcore_auth_db
DB_USER=vetcore_auth_user
DB_PASSWORD=vetcore_pass

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
```

**Nota:** El archivo `.env.example` puede usarse como plantilla.

## Instalación y Ejecución

### Opción 1: Ejecución Local sin Docker (Desarrollo rápido)

**Requisitos previos:**
- Node.js 18+ instalado
- MySQL 8.0 corriendo en localhost:3306
- Base de datos `vetcore_auth_db` creada

**Pasos:**

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de MySQL local
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **O ejecutar en modo producción:**
   ```bash
   npm start
   ```

El servicio estará disponible en `http://localhost:3000`

---

### Opción 2: Ejecución con Docker Compose (Incluye MySQL)

**Requisitos previos:**
- Docker Desktop instalado y corriendo

**Pasos:**

1. **Levantar el servicio con su base de datos:**
   ```bash
   docker-compose up
   ```

   Esto levantará:
   - Auth Service en el puerto `3000`
   - MySQL en el puerto `3308` (mapeado externamente)

2. **Levantar en segundo plano:**
   ```bash
   docker-compose up -d
   ```

3. **Ver logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Detener el servicio:**
   ```bash
   docker-compose down
   ```

---

### Opción 3: Construcción y Publicación de Imagen Docker

**Para construir la imagen localmente:**

```bash
# Construir con nombre local
docker build -t vetcore-auth:latest .

# O construir con tu usuario de Docker Hub
docker build -t tuusuario/vetcore-auth:latest .
```

**Para publicar en Docker Hub (opcional):**

1. **Login en Docker Hub:**
   ```bash
   docker login
   ```

2. **Construir con tu usuario:**
   ```bash
   docker build -t tuusuario/vetcore-auth:latest .
   ```

3. **Publicar imagen:**
   ```bash
   docker push tuusuario/vetcore-auth:latest
   ```

4. **Otros pueden descargar tu imagen:**
   ```bash
   docker pull tuusuario/vetcore-auth:latest
   ```

---

## API Endpoints

### Autenticación

#### `POST /api/auth/register`
Registra un nuevo usuario.

**Request body:**
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "password123",
  "roleId": 2
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com",
    "roleId": 2
  }
}
```

#### `POST /api/auth/login`
Inicia sesión y retorna un token JWT.

**Request body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com",
    "role": {
      "id": 2,
      "name": "Veterinarian"
    }
  }
}
```

### Usuarios (Requieren autenticación)

#### `GET /api/users`
Obtiene todos los usuarios (solo Admin).

**Headers:**
```
Authorization: Bearer <token>
```

#### `GET /api/users/:id`
Obtiene un usuario por ID.

#### `PUT /api/users/:id`
Actualiza un usuario.

#### `DELETE /api/users/:id`
Elimina un usuario (soft delete).

---

## Roles Predeterminados

El servicio crea automáticamente los siguientes roles al iniciar:

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1  | Admin  | Administrador del sistema |
| 2  | Veterinarian | Veterinario |
| 3  | Receptionist | Recepcionista |

---

## Base de Datos

### Conexión con MySQL Workbench

Si estás usando Docker Compose, puedes conectarte a la base de datos con:

```
Host: 127.0.0.1
Port: 3308
Username: root
Password: rootpassword
Database: vetcore_auth_db
```

### Tablas

- **users:** Almacena información de usuarios y contraseñas hasheadas
- **roles:** Roles del sistema
- Relación: User `belongsTo` Role

---

## Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm test
```

---

## Troubleshooting

### Error: "Unable to connect to the database"

- Verifica que MySQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Si usas Docker, verifica que el contenedor de MySQL esté healthy: `docker ps`

### Error: "Port 3000 is already in use"

- Cambia el puerto en `.env`:
  ```env
  PORT=3002
  ```

### Los cambios no se reflejan en Docker

- Reconstruye la imagen:
  ```bash
  docker-compose up --build
  ```

---

## Parte del Sistema VetCore

Este servicio es parte de **VetCore**, un sistema de microservicios para la gestión integral de veterinarias. VetCore está compuesto por:

- **Auth Service** (este servicio) - Autenticación y autorización
- **Patients Service** - Gestión de pacientes/mascotas
- **API Gateway** - Punto de entrada único y enrutamiento
- **Frontend** - Interfaz de usuario en React
- **Appointments Service** (próximamente) - Gestión de citas

Para ejecutar el sistema completo, consulta el repositorio `vetcore-infrastructure`.

---

## Licencia

Este proyecto es parte de VetCore y está bajo [indicar licencia].

## Contribuciones

[Indicar cómo contribuir al proyecto]

## Contacto

[Indicar información de contacto o enlaces al proyecto principal]