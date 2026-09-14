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
