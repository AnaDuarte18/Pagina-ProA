export interface Empresa {
  ID: number;
  Nombre: string;
  Descripcion?: string;
  imagen: string;
  estadoEmpresaID?: number;
  estadoNombre?: string;
}

export const MOCK_EMPRESAS: Empresa[] = [
  {
    ID: 1,
    Nombre: "Mercado Libre",
    Descripcion: "E-commerce y desarrollo de software financiero a escala regional.",
    imagen: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&auto=format",
    estadoEmpresaID: 1,
    estadoNombre: "Activa",
  },
  {
    ID: 2,
    Nombre: "Globant",
    Descripcion: "Soluciones de transformación digital, inteligencia artificial y desarrollo cloud.",
    imagen: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&auto=format",
    estadoEmpresaID: 1,
    estadoNombre: "Activa",
  },
  {
    ID: 3,
    Nombre: "Accenture",
    Descripcion: "Consultoría tecnológica, arquitectura de software y ciberseguridad.",
    imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
    estadoEmpresaID: 1,
    estadoNombre: "Activa",
  },
  {
    ID: 4,
    Nombre: "Telecom Argentina",
    Descripcion: "Infraestructura de telecomunicaciones, redes y servicios digitales.",
    imagen: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&auto=format",
    estadoEmpresaID: 1,
    estadoNombre: "Activa",
  },
  {
    ID: 5,
    Nombre: "ZF Argentina (San Francisco)",
    Descripcion: "Sistemas avanzados de manufactura automotriz e integración industrial 4.0.",
    imagen: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&auto=format",
    estadoEmpresaID: 1,
    estadoNombre: "Activa",
  },
  {
    ID: 6,
    Nombre: "Macser IT",
    Descripcion: "Desarrollo de software a medida, aplicaciones web y móviles para empresas.",
    imagen: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop&auto=format",
    estadoEmpresaID: 1,
    estadoNombre: "Activa",
  },
];
