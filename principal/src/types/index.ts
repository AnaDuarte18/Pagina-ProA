/** Tipos compartidos entre componentes, servicios y hooks. */

export interface Noticia {
  tag: string;
  fecha: string;
  titulo: string;
  img: string;
  alt: string;
}

export interface Evento {
  mes: string;
  dia: string;
  nombre: string;
  hora: string;
  tipo: string;
}

export interface Materia {
  icono: string;
  mono: boolean;
  nombre: string;
  desc: string;
  badge: string;
}

export interface MaterialItem {
  id: number;
  titulo: string;
  descripcion: string;
  asignatura: string;
  clasificacion: string;
  docente: string;
  fecha: string;
  paginas: number;
  archivo: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  roleId: number;
  role: string;
  picture?: string | null;
  estadoCuentaId?: number;
  solicitudDocente?: boolean;
  cursoId?: number | null;
  cursoNombre?: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export interface NotificacionItem {
  ID: number;
  Titulo: string;
  mensaje: string;
  fechaLeida: string | null;
  tipoID: number;
  tipoNombre?: string;
}

export interface CuentaItem {
  ID: number;
  NombreApellido: string;
  correo: string;
  rolID: number;
  rolNombre: string;
  estadoCuentaID: number;
  estadoCuenta: string;
  solicitudDocente: boolean | number;
}

export interface CursoItem {
  ID: number;
  anio: string;
  division: string;
}

export interface NovedadBackendItem {
  ID: number;
  titulo: string;
  cuerpo: string;
  imagen?: string | null;
  cuentaID: number;
  autorNombre?: string;
  fecha_publicacion?: string | null;
  asignaturaID?: number | null;
  asignaturaNombre?: string | null;
  estadoID: number;
  estadoNombre?: string;
  comentarioAdmin?: string | null;
  fechaDeCreacion: string;
}

export interface EventoBackendItem {
  ID: number;
  titulo: string;
  cuerpo: string;
  cuentaID: number;
  autorNombre?: string;
  fecha_publicacion?: string | null;
  asignaturaID?: number | null;
  asignaturaNombre?: string | null;
  estadoID: number;
  estadoNombre?: string;
  comentarioAdmin?: string | null;
  fechaDeCreacion: string;
  cursoIDs?: string | number[];
}

export interface MaterialBackendItem {
  ID: number;
  Titulo: string;
  descripcion?: string | null;
  archivo: string;
  cuentaID: number;
  autorNombre?: string;
  fecha_publicacion?: string | null;
  clasificacionID: number;
  clasificacionNombre?: string;
  estadoID: number;
  estadoNombre?: string;
  fechaDeCreacion: string;
  cursoIDs?: string | number[];
  asignaturaIDs?: string | number[];
}