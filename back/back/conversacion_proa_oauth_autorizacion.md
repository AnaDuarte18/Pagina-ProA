# Conversación: Diseño de base de datos, endpoints, OAuth y autorización

## Resumen

Esta conversación reúne las revisiones y decisiones realizadas sobre el diseño de una base de datos y su API para el sistema PROA.

## 1. Diseño de base de datos

Se revisó un modelo relacional para administrar:

- Administradores
- Docentes
- Alumnos
- Usuarios
- Cursos
- Asignaturas
- Novedades o posteos
- Eventos
- Materiales
- Estados
- Historial
- Notificaciones

Se aclaró que **Novedad equivale a Posteo/Publicación**.

Las entidades principales incluyen:

- `Rol`
- `Cuenta`
- `estadoCuenta`
- `Alumno`
- `AlumnoCurso`
- `Curso`
- `Asignatura`
- `Evento`
- `EventosCursos`
- `Novedad`
- `NovedadesCursos`
- `Material`
- `MaterialCursos`
- `Clasificación`
- `Estado`
- `Historial`
- `Notificacion`
- `tipoNotificacion`

## 2. Historial

La tabla `Historial` registra los cambios de estado de objetos del sistema.

Estructura conceptual:

```text
Historial
---------
ID
novedadID
eventoID
materialID
estadoAnteriorID
estadoNuevoID
cuentaID
comentario
fechaDeCreacion
```

La regla recomendada es que solamente uno de estos campos tenga valor:

- `novedadID`
- `eventoID`
- `materialID`

Los otros deben quedar en `NULL`.

El historial no debería crearse manualmente desde el frontend. Debe generarse automáticamente cuando una operación válida cambia el estado de un objeto.

## 3. Notificaciones

La notificación se genera automáticamente cuando ocurre una acción relevante, por ejemplo:

- Aprobación de una publicación.
- Devolución de una publicación.
- Aprobación o rechazo de una cuenta.
- Aprobación o rechazo de una asignatura.

El flujo recomendado es transaccional:

```text
Cambiar estado
      |
      +--> Crear Historial
      |
      +--> Crear Notificación
      |
     COMMIT
```

Así se evita que el estado cambie sin registrar el historial o sin generar la notificación.

## 4. Tabla tipoNotificacion

Se agregó la tabla:

```text
tipoNotificacion
----------------
ID PK
Tipo
```

La tabla `Notificacion` queda relacionada con ella:

```text
Notificacion
------------
ID PK
cuentaID FK
Titulo
mensaje
fechaLeida
tipoID FK
```

SQL:

```sql
CREATE TABLE tipoNotificacion (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(100) NOT NULL
);

CREATE TABLE Notificacion (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    cuentaID INT NOT NULL,
    Titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fechaLeida DATETIME NULL,
    tipoID INT NOT NULL,

    FOREIGN KEY (cuentaID) REFERENCES Cuenta(ID),
    FOREIGN KEY (tipoID) REFERENCES tipoNotificacion(ID)
);
```

## 5. Estado de cuenta

Se agregó `estadoCuenta`, relacionada desde `Cuenta`.

Estados posibles:

```text
Pendiente
Activo
Rechazado
Suspendido
```

Reglas:

- Los correos institucionales pueden registrarse automáticamente según la política definida.
- Los correos externos quedan pendientes de aprobación.
- El administrador puede aprobar, rechazar, suspender o cambiar el estado.
- El administrador puede cambiar el rol.

Endpoints conceptuales:

```http
POST /auth/registro
PATCH /cuentas/{id}/estado
PATCH /cuentas/{id}/rol
GET /cuentas/{id}
DELETE /cuentas/{id}
```

Se recomendó considerar borrado lógico para conservar información histórica.

## 6. Aprobación de asignaturas

Las asignaturas ingresadas por docentes deben seguir un flujo similar al de novedades, eventos y materiales:

```text
Docente crea asignatura
        |
        v
Estado = Pendiente
        |
        v
Administrador revisa
        |
   +----+----+
   |         |
   v         v
Aprobada  Rechazada
```

Endpoints:

```http
GET /asignaturas
POST /asignaturas
GET /asignaturas/{id}
PATCH /asignaturas/{id}
PATCH /asignaturas/{id}/estado
```

Solo las asignaturas aprobadas deberían poder asociarse a novedades, eventos o materiales, si así lo requiere la lógica del sistema.

## 7. Endpoints recomendados

### Autenticación y cuentas

```http
POST   /auth/registro
POST   /auth/login
GET    /cuentas/{id}
PATCH  /cuentas/{id}/estado
PATCH  /cuentas/{id}/rol
DELETE /cuentas/{id}
```

### Alumnos

```http
GET   /alumnos/{id}
PATCH /alumnos/{id}/curso
```

Como existe `AlumnoCurso`, se recomendó conservar el historial académico con fechas de inicio y fin en lugar de sobrescribir siempre el curso anterior.

### Novedades / posteos

```http
GET    /novedades
POST   /novedades
GET    /novedades/{id}
PATCH  /novedades/{id}
PATCH  /novedades/{id}/estado
DELETE /novedades/{id}
GET    /novedades/{id}/historial
```

### Eventos

```http
GET    /eventos
POST   /eventos
GET    /eventos/{id}
PATCH  /eventos/{id}
PATCH  /eventos/{id}/estado
DELETE /eventos/{id}
GET    /eventos/{id}/historial
```

### Materiales

```http
GET    /materiales
POST   /materiales
GET    /materiales/{id}
PATCH  /materiales/{id}
PATCH  /materiales/{id}/estado
DELETE /materiales/{id}
GET    /materiales/{id}/historial
```

### Notificaciones

```http
GET   /notificaciones
PATCH /notificaciones/{id}/leida
```

No se recomienda exponer:

```http
POST /historial
```

porque el historial debe ser consecuencia de una acción válida del sistema.

## 8. OAuth

Se distinguieron dos conceptos:

```text
OAuth / OpenID Connect = autenticar quién es el usuario
Base de datos de PROA = determinar qué puede hacer
```

Flujo:

```text
Usuario
   |
   v
Proveedor OAuth
   |
   v
Backend PROA
   |
   v
Busca identidad en Cuenta
   |
   v
Verifica estadoCuenta
   |
   v
Obtiene rol y permisos
   |
   v
Autoriza o rechaza
```

OAuth no debe decidir por sí solo si un usuario es Alumno, Docente o Administrador.

## 9. Tabla Cuenta usando exclusivamente OAuth

Si el login depende completamente de OAuth, no se almacena una contraseña local.

SQL recomendado:

```sql
CREATE TABLE Cuenta (
    ID INT AUTO_INCREMENT PRIMARY KEY,

    NombreApellido VARCHAR(150) NOT NULL,

    correo VARCHAR(255) NOT NULL UNIQUE,

    proveedorOAuth VARCHAR(50) NOT NULL,

    oauthID VARCHAR(255) NOT NULL,

    rolID INT NOT NULL,

    estadoCuentaID INT NOT NULL,

    CONSTRAINT FK_Cuenta_Rol
        FOREIGN KEY (rolID)
        REFERENCES Rol(ID),

    CONSTRAINT FK_Cuenta_EstadoCuenta
        FOREIGN KEY (estadoCuentaID)
        REFERENCES estadoCuenta(ID),

    CONSTRAINT UQ_Cuenta_OAuth
        UNIQUE (proveedorOAuth, oauthID)
);
```

No se incluyen:

```text
contrasena
hashContrasena
```

porque el proveedor OAuth administra la autenticación.

Campos:

- `ID`: identificador interno de PROA.
- `NombreApellido`: nombre del usuario.
- `correo`: correo del usuario.
- `proveedorOAuth`: por ejemplo, `google` o `microsoft`.
- `oauthID`: identificador estable del usuario en OAuth, normalmente el claim `sub`.
- `rolID`: FK a `Rol`.
- `estadoCuentaID`: FK a `estadoCuenta`.

La restricción:

```sql
UNIQUE (proveedorOAuth, oauthID)
```

evita registrar dos veces la misma identidad OAuth.

## 10. Ejemplo de registro OAuth

Si el proveedor devuelve:

```json
{
  "sub": "109283746512938",
  "email": "ana@institucion.edu.ar",
  "name": "Ana Duarte"
}
```

Se podría guardar:

```sql
INSERT INTO Cuenta (
    NombreApellido,
    correo,
    proveedorOAuth,
    oauthID,
    rolID,
    estadoCuentaID
)
VALUES (
    'Ana Duarte',
    'ana@institucion.edu.ar',
    'google',
    '109283746512938',
    1,
    2
);
```

Los valores de `rolID` y `estadoCuentaID` dependen de los registros de las tablas catálogo.

Se recomienda buscar por:

```sql
WHERE proveedorOAuth = 'google'
  AND oauthID = '109283746512938'
```

y no depender únicamente del correo.

## 11. Autorización por niveles de acceso

Se recomendó combinar:

1. RBAC, autorización basada en roles.
2. Reglas de negocio.
3. Validación de propiedad del recurso.

Ejemplo:

Un docente puede editar solamente sus propias publicaciones, mientras que un administrador puede editar cualquier publicación.

No alcanza con comprobar solamente el rol.

## 12. Flujo de autorización

```text
Request
   |
   v
Validar token OAuth/OIDC
   |
   v
Obtener identidad
   |
   v
Buscar Cuenta
   |
   v
¿estadoCuenta = Activo?
   |
   v
Verificar rol
   |
   v
Verificar propiedad o relación con el recurso
   |
   v
Ejecutar endpoint
```

Códigos recomendados:

```text
401 Unauthorized
```

Usuario no autenticado o token inválido.

```text
403 Forbidden
```

Usuario autenticado pero sin permisos o con cuenta no activa.

## 13. Middleware conceptual

```javascript
function requireAuth(req, res, next) {
    // Validar access token OAuth/OIDC
    // Obtener identidad del usuario

    if (!req.user) {
        return res.status(401).json({
            error: "No autenticado"
        });
    }

    next();
}
```

Middleware de roles:

```javascript
function requireRole(...rolesPermitidos) {
    return async (req, res, next) => {
        const cuenta = await obtenerCuenta(req.user.id);

        if (cuenta.estadoCuentaID !== ESTADO_ACTIVO) {
            return res.status(403).json({
                error: "Cuenta no activa"
            });
        }

        if (!rolesPermitidos.includes(cuenta.rolID)) {
            return res.status(403).json({
                error: "No tienes permisos"
            });
        }

        req.cuenta = cuenta;
        next();
    };
}
```

Ejemplo:

```javascript
router.patch(
    "/novedades/:id/estado",
    requireAuth,
    requireRole(ROL_ADMIN),
    cambiarEstadoNovedad
);
```

## 14. Matriz general de permisos

| Acción | Admin | Docente | Alumno |
|---|---:|---:|---:|
| Iniciar sesión | Sí | Sí | Sí |
| Crear novedad | Sí | Sí | No |
| Editar novedad propia | Sí | Sí | No |
| Editar novedad ajena | Sí | No | No |
| Aprobar novedad | Sí | No | No |
| Crear evento | Sí | Sí | No |
| Aprobar evento | Sí | No | No |
| Crear material | Sí | Sí | No |
| Aprobar material | Sí | No | No |
| Crear asignatura | Según regla | Sí | No |
| Aprobar asignatura | Sí | No | No |
| Administrar cuentas | Sí | No | No |
| Cambiar rol | Sí | No | No |
| Cambiar estadoCuenta | Sí | No | No |
| Ver notificaciones propias | Sí | Sí | Sí |

## 15. Arquitectura final

```text
OAuth / OIDC
     |
     v
Autenticación
     |
     v
Cuenta
     ├── rolID
     ├── estadoCuentaID
     ├── proveedorOAuth
     └── oauthID
     |
     v
Middleware de autorización
     ├── ¿Cuenta activa?
     ├── ¿Rol permitido?
     ├── ¿Es propietario del recurso?
     └── ¿La operación está permitida?
     |
     v
Endpoint
```

Resumen:

```text
OAuth = ¿Quién sos?
Cuenta = ¿Qué usuario sos dentro de PROA?
EstadoCuenta = ¿Podés usar la cuenta?
Rol = ¿Qué tipo de usuario sos?
Permisos = ¿Qué acciones podés realizar?
Propiedad del recurso = ¿Podés modificar ESTE objeto?
```
