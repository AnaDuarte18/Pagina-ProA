import type { User } from "@/types";

/**
 * Usuarios de prueba para desarrollo local.
 * Los IDs de rol y estado coinciden con los valores reales del backend (bdd.sql):
 *   Roles:        Administrador=1 | Docente=2 | Alumno=3
 *   EstadoCuenta: Pendiente=1 | Activo=2 | Rechazado=3 | Suspendido=4
 *
 * Para usar uno de estos usuarios activá VITE_MOCK_AUTH=true en el .env
 * y seleccioná el índice desde el selector de mock en pantalla.
 */
export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Ana Paula Duarte",
    email: "admin@escuelasproa.edu.ar",
    roleId: 1,
    role: "Administrador",
    estadoCuentaId: 2, // Activo
    solicitudDocente: false,
    picture: null,
  },
  {
    id: 2,
    name: "Nikito67",
    email: "nolmos@escuelasproa.edu.ar",
    roleId: 2,
    role: "Docente",
    estadoCuentaId: 2, // Activo
    solicitudDocente: false,
    picture: null,
  },
  {
    id: 3,
    name: "Lucas Méndez",
    email: "lmendez@escuelasproa.edu.ar",
    roleId: 3,
    role: "Alumno",
    estadoCuentaId: 2, // Activo — correo institucional con curso ya asignado
    solicitudDocente: false,
    cursoId: 7,
    cursoNombre: "4° Año A / S",
    picture: null,
  },
  {
    id: 4,
    name: "Lucía Luque",
    email: "luchu@gmail.com",
    roleId: 3,
    role: "Alumno",
    estadoCuentaId: 1, // Pendiente — correo externo sin aprobar
    solicitudDocente: false,
    picture: null,
  },
  {
    id: 5,
    name: "Martín Sosa",
    email: "martin.sosa@hotmail.com",
    roleId: 3,
    role: "Alumno",
    estadoCuentaId: 3, // Rechazado
    solicitudDocente: false,
    picture: null,
  },
  {
    id: 6,
    name: "Valeria Torres",
    email: "vtorres@escuelasproa.edu.ar",
    roleId: 3,
    role: "Alumno",
    estadoCuentaId: 2, // Activo — tiene solicitud de docente pendiente
    solicitudDocente: true,
    picture: null,
  },
];

/** @deprecated Usá MOCK_USERS en su lugar */
export const USER = MOCK_USERS;
