# API PKMN

API REST para gestionar **Pokémon** y sus **tipos**, construida con NestJS, TypeORM y MySQL. Cada Pokémon tiene uno o más tipos (relación muchos a muchos), y los tipos deben existir antes de asignarlos.

## Tecnologías

- [NestJS](https://nestjs.com/) 12 (TypeScript, ESM)
- [TypeORM](https://typeorm.io/) con MySQL (XAMPP en desarrollo)
- `class-validator` y `class-transformer` para validar los datos de entrada
- `@nestjs/config` para leer la configuración desde un archivo `.env`
- Vitest y Supertest para los tests

## Requisitos

- Node.js 20.19 o superior (o 22.12 o superior). Se puede comprobar con `node -v`.
- XAMPP con el módulo **MySQL** (y **Apache**, para usar phpMyAdmin).

## Instalación y puesta en marcha

1. **Instalar las dependencias**

   ```bash
   npm install
   ```

2. **Crear la base de datos.** Con XAMPP en marcha (Apache y MySQL en verde), entrar a `http://localhost/phpmyadmin`, pulsar **Nueva** y crear una base llamada `pokemon` con el cotejamiento `utf8mb4_general_ci`. Las tablas las crea TypeORM automáticamente al iniciar la aplicación; la base de datos no.

3. **Configurar las variables de entorno.** Copiar `.env.example` como `.env`:

   ```bash
   cp .env.example .env
   ```

   En Windows también se puede duplicar el archivo manualmente y renombrarlo. Los valores por defecto sirven para una instalación estándar de XAMPP:

   | Variable      | Descripción                    | Valor por defecto |
   | ------------- | ------------------------------ | ----------------- |
   | `DB_HOST`     | Servidor de MySQL              | `127.0.0.1`       |
   | `DB_PORT`     | Puerto de MySQL                | `3306`            |
   | `DB_USERNAME` | Usuario de MySQL               | `root`            |
   | `DB_PASSWORD` | Contraseña (vacía en XAMPP)    | _(vacía)_         |
   | `DB_NAME`     | Nombre de la base de datos     | `pokemon`         |
   | `PORT`        | Puerto en el que corre la API  | `3000`            |

4. **Iniciar la aplicación**

   ```bash
   npm run start:dev
   ```

   La API queda disponible en `http://localhost:3000`.

## Endpoints

Todas las rutas parten de `/pokemon`.

### Pokémon

| Método   | Ruta            | Descripción                                    |
| -------- | --------------- | ---------------------------------------------- |
| `POST`   | `/pokemon`      | Crea un Pokémon                                |
| `GET`    | `/pokemon`      | Lista todos los Pokémon con sus tipos          |
| `GET`    | `/pokemon/:id`  | Obtiene un Pokémon por id                      |
| `PATCH`  | `/pokemon/:id`  | Actualiza nombre, descripción y/o tipos        |
| `DELETE` | `/pokemon/:id`  | Elimina un Pokémon                             |

**Crear un Pokémon** (`POST /pokemon`):

```json
{
  "nombre": "Charmander",
  "descripcion": "Pokémon lagartija de tipo fuego",
  "tipos": [1]
}
```

- `nombre`: texto obligatorio, máximo 50 caracteres.
- `descripcion`: texto obligatorio, máximo 250 caracteres.
- `tipos`: lista de ids de tipos existentes; obligatoria, con al menos un elemento y sin repetidos.

**Actualizar un Pokémon** (`PATCH /pokemon/:id`): se envía solo lo que se quiere cambiar.

```json
{
  "descripcion": "Descripción nueva"
}
```

Si se envía `tipos`, la lista enviada **reemplaza** a la anterior.

### Tipos

| Método   | Ruta                | Descripción                              |
| -------- | ------------------- | ---------------------------------------- |
| `POST`   | `/pokemon/tipo`     | Crea un tipo                             |
| `GET`    | `/pokemon/tipo`     | Lista todos los tipos                    |
| `GET`    | `/pokemon/tipo/:id` | Obtiene un tipo por id                   |
| `PATCH`  | `/pokemon/tipo/:id` | Cambia el nombre de un tipo              |
| `DELETE` | `/pokemon/tipo/:id` | Elimina un tipo que no esté en uso       |

**Crear un tipo** (`POST /pokemon/tipo`):

```json
{
  "nombre": "Fuego"
}
```

`nombre` es obligatorio y admite un máximo de 50 caracteres.

### Códigos de respuesta

| Código            | Cuándo ocurre                                                                  |
| ----------------- | ------------------------------------------------------------------------------ |
| `200 OK`          | Lectura, actualización o eliminación correcta                                  |
| `201 Created`     | Creación correcta                                                              |
| `400 Bad Request` | Datos inválidos, campos desconocidos, id no numérico o tipos que no existen    |
| `404 Not Found`   | El Pokémon o el tipo solicitado no existe                                      |
| `409 Conflict`    | Se intenta eliminar un tipo que todavía lo usa algún Pokémon                   |

## Decisiones de diseño

- **Validación estricta:** la aplicación rechaza los campos que no están definidos en los DTO (`whitelist` y `forbidNonWhitelisted`).
- **Tipos primero:** al crear o editar un Pokémon se comprueba que todos los ids de tipo existan; si falta alguno, no se guarda nada y la respuesta indica cuáles faltan.
- **Integridad de los datos:** no se puede eliminar un tipo que esté asignado a algún Pokémon, para que ningún Pokémon quede sin tipos.
- **Configuración fuera del código:** las credenciales de la base de datos viven en el archivo `.env`, que no se sube al repositorio.
- **`synchronize: true`:** TypeORM crea y ajusta las tablas automáticamente. Es cómodo en desarrollo, pero no se recomienda en producción.

## Tests

```bash
npm test          # tests unitarios (servicio y controlador, con repositorios simulados)
npm run test:e2e  # tests de extremo a extremo (requieren MySQL en marcha y la base creada)
```

Los tests unitarios no necesitan base de datos. Los e2e usan la base real y solo realizan lecturas.

## Estructura del proyecto

```
src/
├── main.ts                  # Arranque y configuración de validación global
├── app.module.ts            # Módulo raíz y conexión a la base de datos
└── pokemon/
    ├── pokemon.controller.ts
    ├── pokemon.service.ts
    ├── pokemon.module.ts
    ├── dto/                 # Datos de entrada y sus validaciones
    └── entities/            # Tablas: pokemon, tipo y la tabla intermedia pokemon_tipos
test/
└── app.e2e-spec.ts
```
