import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import type { HitoHistoria } from "@/types";
import proa2014 from "@/imports/2014.jpg";
import proa2019 from "@/imports/2019.jpg";
import proa2024 from "@/imports/2024.jpg";


const HITOS_HISTORIA: HitoHistoria[] = [
  {
    periodo: "2014 — Los Comienzos",
    titulo: "Nacimiento de un Modelo Pionero",
    subtitulo: "La primera escuela PRoA",
    texto:
      "En el marco del Programa Avanzado de Educación Secundaria con Énfasis en Tecnologías de la Información y la Comunicación (PRoA), impulsado por el Ministerio de Educación de la Provincia de Córdoba, surge la Escuela PRoA San Francisco como una de las primeras instituciones experimentales dedicadas a vincular la formación secundaria con el desarrollo de software y la cultura digital. Desde el inicio, el proyecto propuso jornadas extendidas, grupos reducidos y una metodología basada en proyectos colaborativos. Sin embargo, en este tiempo aun no contabamos con un espacio propio para habitar como escuela y las clases se dictaban en aulas y espacios proporcionados por otras escuelas públicas. Esta experiencia ayudó a forjar la fuerte identidad de la institución caracterizada por la resiliencia y el sentido de comunidad de quienes forman parte de ella.",
    imagen:
      proa2014,
    imagenAlt: "Docentes en reunión",
    pieDeFoto: "Docentes en reunión en un aula de la escuela primaria Dr. Raúl Villafañe prestada a la escuela ProA.",
  },
  {
    periodo: "2019 — Nuestro Propio Espacio",
    titulo: "Innaguración de nuestro edificio",
    subtitulo: "Los frutos del esfuerzo y la lucha comunitaria",
    texto:
      "Luego de años de reclamos por un espacio propio para poder dar clases y convivir como escuela, en el año 2019 se innagura el edificio de la Escuela Experimental ProA Técnica. Gracias al tremendo esfuerzo de la comunidad y de la cooperadora, quienes ya se habían encargado de asegurarse que los alumnos cuenten con computadoras para enfocarse en su especialidad, este pudo contar con comodidades como televisores para cada aula y aires acondicionados.",
    imagen:
      proa2019,
    imagenAlt: "Docentes en frente del edificio de la institución",
    pieDeFoto: "Docentes en frente del edificio de la institución por el que tanto lucharon.",
  },
  {
    periodo: "2024 — Ahora sí",
    titulo: "10° Aniversario y muchos cambios",
    subtitulo: "Despedida a Alicia Ferreyra como directora y bienvenida a Natalí Pesaresi",
    texto:
      "Este año nos tocó despedir a quien había estado a la cabeza de esta maravillosa escuela durante todos estos años: Alicia Ferreyra, quien dejaría esta comunidad en manos de Natalí Pesaresi, nuestra formidable directora. Pero este no fue el único cambio que llegó con el décimo aniversario de la institución, ya que la comunidad educativa también celebró la inauguración del nuevo tramo del edificio en San Francisco, permitiendonos encontrarnos por primera vez todos juntos cursando en nuestra propia escuela, con dos plantas y ocho nuevas aulas. Estas pronto serían equipadas por la cooperadora con sus propios aires acondicioanados y televisores",
    imagen:
      proa2024,
    imagenAlt: "Natalí Pesaresi recibiendo un ramo de flores como felicitación por su nuevo puesto",
    pieDeFoto: "Natalí Pesaresi, nuestra formidable directora.",
  },
];

export default function Historia() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#E7ECEF]">
      {/* Cabecera institucional */}
      <section className="bg-[#274C77] text-white py-14 px-6 relative overflow-hidden border-b border-[#6096BA]/30">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#A3CEF1 1px, transparent 1px), linear-gradient(90deg, #A3CEF1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Trayectoria institucional
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white">
            Nuestra <span className="text-[#A3CEF1]">Historia</span>
          </h1>
          <p className="text-[#E7ECEF]/80 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
            Desde los primeros pasos de la educación experimental en software hasta convertirnos
            en la escuela técnica de referencia tecnológica en San Francisco y la región.
          </p>
        </div>
      </section>

      {/* Contenido principal: Hilo de texto e ilustraciones */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        {/* Introducción narrativa */}
        <div className="bg-white rounded-xl border border-[#c0cdd7] p-8 md:p-10 mb-12 shadow-xs">
          <p className="font-mono-code text-[#6096BA] text-xs uppercase tracking-wider mb-2">
            // El hilo conductor
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#274C77] mb-4">
            Una década formando a los creadores de tecnología
          </h2>
          <p className="text-slate-700 leading-relaxed text-base md:text-lg mb-4">
            La Escuela Experimental PRoA con orientación Técnica en Programación de San Francisco
            nació con una premisa clara: brindar una educación pública de excelencia adaptada a
            las transformaciones del siglo XXI. En un mundo guiado por el software, aprender a
            programar no es únicamente adquirir una habilidad técnica, sino desarrollar un pensamiento
            crítico, lógico y colaborativo para transformar la sociedad.
          </p>
        </div>

        {/* Hilo de texto cronológico */}
        <div className="relative pl-6 md:pl-10 border-l-2 border-[#6096BA]/40 space-y-16">
          {HITOS_HISTORIA.map((hito, index) => (
            <article key={hito.periodo} className="relative">
              {/* Nodo indicador del hilo */}
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-5 h-5 rounded-full bg-[#274C77] border-4 border-[#E7ECEF] shadow-xs" />

              {/* Encabezado del hito */}
              <div className="mb-4">
                <span className="inline-block font-mono-code text-xs font-bold text-[#274C77] bg-[#A3CEF1]/40 border border-[#274C77]/20 px-2.5 py-1 rounded-sm mb-2">
                  {hito.periodo}
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-[#274C77]">
                  {hito.titulo}
                </h3>
                <p className="text-sm font-semibold text-[#6096BA] mt-0.5">
                  {hito.subtitulo}
                </p>
              </div>

              {/* Bloque de lectura e imagen */}
              <div className="grid md:grid-cols-12 gap-6 items-start">
                {/* Hilo de texto explicativo */}
                <div className="md:col-span-7 bg-white rounded-xl border border-[#c0cdd7] p-6 shadow-xs">
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                    {hito.texto}
                  </p>
                </div>

                {/* Imagen ilustrativa */}
                <div className="md:col-span-5 flex flex-col">
                  <div className="rounded-xl overflow-hidden border border-[#c0cdd7] bg-white shadow-xs">
                    <img
                      src={hito.imagen}
                      alt={hito.imagenAlt}
                      className="w-full h-48 md:h-52 object-cover"
                      loading="lazy"
                    />
                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <p className="text-xs text-slate-500 italic leading-snug">
                        {hito.pieDeFoto}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Cierre / Llamado a la acción */}
        <div className="mt-16 bg-[#274C77] text-white rounded-xl p-8 md:p-10 border border-[#6096BA]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
              ¿Querés conocer más sobre nuestro plan de estudios?
            </h3>
            <p className="text-[#E7ECEF]/80 text-sm max-w-xl">
              Descubrí las materias y áreas de especialidad que cursan nuestros estudiantes año a año.
            </p>
          </div>
          <button
            onClick={() => navigate("/academico")}
            className="shrink-0 bg-[#A3CEF1] text-[#274C77] font-bold px-6 py-3 rounded text-sm hover:bg-white transition-colors"
          >
            Ver Propuesta Académica →
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
