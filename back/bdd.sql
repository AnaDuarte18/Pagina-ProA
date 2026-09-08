CREATE DATABASE IF NOT EXISTS proa
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE proa;

-- =========================================================
-- 1. ROL
-- =========================================================

CREATE TABLE Rol (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    NivelDeAcceso INT NOT NULL
);

-- =========================================================
-- 2. CUENTA
-- =========================================================

CREATE TABLE EstadoCuenta (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Cuenta (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NombreApellido VARCHAR(150) NOT NULL,
    rolID INT NOT NULL,
    estadoCuentaID INT NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,

    CONSTRAINT FK_Cuenta_Rol
        FOREIGN KEY (rolID)
        REFERENCES Rol(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Cuenta_EstadoCuenta
        FOREIGN KEY (estadoCuentaID)
        REFERENCES EstadoCuenta(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 3. ALUMNO
-- =========================================================

CREATE TABLE Alumno (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    cuentaID INT NOT NULL UNIQUE,

    CONSTRAINT FK_Alumno_Cuenta
        FOREIGN KEY (cuentaID)
        REFERENCES Cuenta(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 4. CURSO
-- =========================================================

CREATE TABLE Curso (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    anio VARCHAR(1) NOT NULL,
    division VARCHAR(20) NOT NULL,

    CONSTRAINT UQ_Curso
        UNIQUE (anio, division)
);


-- =========================================================
-- 5. ALUMNO - CURSO
-- =========================================================

CREATE TABLE AlumnoCurso (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    AlumnoID INT NOT NULL,
    CursoID INT NOT NULL,
    anioInicio INT NOT NULL,
    fechaDesde DATE NOT NULL,
    fechaHasta DATE NULL,

    CONSTRAINT FK_AlumnoCurso_Alumno
        FOREIGN KEY (AlumnoID)
        REFERENCES Alumno(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_AlumnoCurso_Curso
        FOREIGN KEY (CursoID)
        REFERENCES Curso(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 6. ASIGNATURA
-- =========================================================

CREATE TABLE Asignatura (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 7. ESTADO
-- =========================================================

CREATE TABLE Estado (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    estado VARCHAR(50) NOT NULL UNIQUE
);


-- =========================================================
-- 8. CLASIFICACION
-- =========================================================

CREATE TABLE Clasificacion (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Clasificacion VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 9. NOVEDAD / POSTEO
-- =========================================================

CREATE TABLE Novedad (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    Cuerpo TEXT NOT NULL,
    Imagen VARCHAR(500) NULL,
    cuentaID INT NOT NULL,
    fecha_publicacion DATETIME NULL,
    asignaturaID INT NOT NULL,
    estadoID INT NOT NULL,
    ComentarioAdmin TEXT NULL,
    fechaDeCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Novedad_Cuenta
        FOREIGN KEY (cuentaID)
        REFERENCES Cuenta(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Novedad_Asignatura
        FOREIGN KEY (asignaturaID)
        REFERENCES Asignatura(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Novedad_Estado
        FOREIGN KEY (estadoID)
        REFERENCES Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 10. NOVEDADES - CURSOS
-- =========================================================

CREATE TABLE NovedadesCursos (
    NovedadID INT NOT NULL,
    CursoID INT NOT NULL,

    PRIMARY KEY (NovedadID, CursoID),

    CONSTRAINT FK_NovedadesCursos_Novedad
        FOREIGN KEY (NovedadID)
        REFERENCES Novedad(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_NovedadesCursos_Curso
        FOREIGN KEY (CursoID)
        REFERENCES Curso(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 11. EVENTO
-- =========================================================

CREATE TABLE Evento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    Cuerpo TEXT NOT NULL,
    cuentaID INT NOT NULL,
    fecha_publicacion DATETIME NULL,
    acceso VARCHAR(50) NULL,
    asignaturaID INT NOT NULL,
    estadoID INT NOT NULL,
    ComentarioAdmin TEXT NULL,
    fechaDeCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Evento_Cuenta
        FOREIGN KEY (cuentaID)
        REFERENCES Cuenta(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Evento_Asignatura
        FOREIGN KEY (asignaturaID)
        REFERENCES Asignatura(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Evento_Estado
        FOREIGN KEY (estadoID)
        REFERENCES Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 12. EVENTOS - CURSOS
-- =========================================================

CREATE TABLE EventosCursos (
    EventoID INT NOT NULL,
    CursoID INT NOT NULL,

    PRIMARY KEY (EventoID, CursoID),

    CONSTRAINT FK_EventosCursos_Evento
        FOREIGN KEY (EventoID)
        REFERENCES Evento(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_EventosCursos_Curso
        FOREIGN KEY (CursoID)
        REFERENCES Curso(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 13. MATERIAL
-- =========================================================

CREATE TABLE Material (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    archivo VARCHAR(500) NOT NULL,
    cuentaID INT NOT NULL,
    fecha_publicacion DATETIME NULL,
    asignaturaID INT NOT NULL,
    clasificacionID INT NOT NULL,
    estadoID INT NOT NULL,
    fechaDeCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Material_Cuenta
        FOREIGN KEY (cuentaID)
        REFERENCES Cuenta(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Material_Asignatura
        FOREIGN KEY (asignaturaID)
        REFERENCES Asignatura(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Material_Clasificacion
        FOREIGN KEY (clasificacionID)
        REFERENCES Clasificacion(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Material_Estado
        FOREIGN KEY (estadoID)
        REFERENCES Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 14. MATERIAL - CURSOS
-- =========================================================

CREATE TABLE MaterialCursos (
    MaterialID INT NOT NULL,
    CursoID INT NOT NULL,

    PRIMARY KEY (MaterialID, CursoID),

    CONSTRAINT FK_MaterialCursos_Material
        FOREIGN KEY (MaterialID)
        REFERENCES Material(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_MaterialCursos_Curso
        FOREIGN KEY (CursoID)
        REFERENCES Curso(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 15. HISTORIAL
-- =========================================================

CREATE TABLE Historial (
    ID INT AUTO_INCREMENT PRIMARY KEY,

    -- Solo uno de estos tres campos debe tener valor
    NovedadID INT NULL,
    EventoID INT NULL,
    MaterialID INT NULL,

    estadoAnteriorID INT NOT NULL,
    estadoNuevoID INT NOT NULL,
    cuentaID INT NOT NULL,
    comentario TEXT NULL,
    fechaDeCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Historial_Novedad
        FOREIGN KEY (NovedadID)
        REFERENCES Novedad(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_Historial_Evento
        FOREIGN KEY (EventoID)
        REFERENCES Evento(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_Historial_Material
        FOREIGN KEY (MaterialID)
        REFERENCES Material(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_Historial_EstadoAnterior
        FOREIGN KEY (estadoAnteriorID)
        REFERENCES Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Historial_EstadoNuevo
        FOREIGN KEY (estadoNuevoID)
        REFERENCES Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_Historial_Cuenta
        FOREIGN KEY (cuentaID)
        REFERENCES Cuenta(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT CK_Historial_UnSoloContenido
        CHECK (
            (NovedadID IS NOT NULL) +
            (EventoID IS NOT NULL) +
            (MaterialID IS NOT NULL) = 1
        )
);

-- =========================================================
-- 16. TIPO NOTIFICACION
-- =========================================================


CREATE TABLE tipoNotificacion (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================================
-- 17. NOTIFICACION
-- =========================================================

CREATE TABLE Notificacion (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    cuentaID INT NOT NULL,
    Titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fechaLeida DATETIME NULL,
    tipoID INT NOT NULL,

    CONSTRAINT FK_Notificacion_Cuenta
        FOREIGN KEY (cuentaID)
        REFERENCES Cuenta(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_Notificacion_Tipo
        FOREIGN KEY (tipoID)
        REFERENCES tipoNotificacion(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================================================
-- 18. INSERTAR DATOS
-- =========================================================

INSERT INTO tipoNotificacion (Tipo)
VALUES
    ('Aprobación'),
    ('Devolución'),
    ('Eliminación'),
    ('Nueva publicación');

INSERT INTO Estado (estado)
VALUES
    ('Pendiente'),
    ('Devuelto'),
    ('Publicado'),
    ('Eliminado');

INSERT INTO Rol (Nombre, NivelDeAcceso)
VALUES
    ('Administrador', 3),
    ('Docente', 2),
    ('Alumno', 1);

INSERT INTO Clasificacion (Clasificacion)
VALUES
    ('Cuadernillo'),
    ('Material de clase'),
    ('Material de lectura'),
    ('Libro');
    
INSERT INTO EstadoCuenta (estado)
VALUES
    ('Pendiente'),
    ('Activo'),
    ('Rechazado'),
    ('Suspendido');

INSERT INTO Curso (anio, division)
VALUES
    ('1', 'A/S'),
    ('2', 'A/S'),
    ('3', 'A/S'),
    ('4', 'A/S'),
    ('5', 'A/S'),
    ('6', 'A/S'),
    ('7', 'A/S'),
    ('1', 'B/F'),
    ('2', 'B/F'),
    ('3', 'B/F'),
    ('4', 'B/F'),
    ('5', 'B/F'),
    ('6', 'B/F'),
    ('7', 'B/F'),