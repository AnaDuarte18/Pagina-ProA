import { MATERIAS } from "@/mocks/materias.mock";
import Empresas from "@/components/Empresas";

export default function Materias() {
  const materias = MATERIAS;

  return (
    <>
      {/* Áreas de conocimiento */}
      <section id="academico" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="font-mono-code text-[#6096BA] text-xs mb-2">// import Materias from "./plan_estudios"</p>
          <h2 className="font-display text-4xl md:text-5xl font-black">
            Áreas de<br />conocimiento
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materias.map((m, i) => (
              <div
                key={i}
                className="group p-7 border border-[#c0cdd7] rounded-sm bg-white hover:border-[#274C77] transition-colors cursor-pointer relative overflow-hidden"
              >
                {m.badge && (
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-[#274C77] text-white px-2 py-0.5 rounded-full">
                    {m.badge}
                  </span>
                )}
                <span
                  className={`mb-4 block ${
                    m.mono ? "font-mono-code text-[#274C77] text-2xl font-bold" : "text-3xl"
                  }`}
                >
                  {m.icono}
                </span>
                <h3 className="font-display font-bold text-xl mb-2 group-hover:text-[#274C77] transition-colors">
                  {m.nombre}
                </h3>
                <p className="text-[#8B8C89] text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
      </section>

      {/* Vida estudiantil */}
      <section className="bg-[#dae4ec]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="font-mono-code text-[#6096BA] text-xs mb-2">// vida.map(actividad =&gt; render)</p>
            <h2 className="font-display text-4xl md:text-5xl font-black">
              Vida<br />estudiantil
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 relative rounded-sm overflow-hidden h-72 bg-[#c0cdd7]">
              <img
                src="https://images.unsplash.com/photo-1525088068454-ff2c453e50e9?w=900&h=500&fit=crop&auto=format"
                alt="Actividades deportivas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#274C77]/80 to-transparent flex items-end p-8">
                <div>
                  <p className="text-white font-display font-bold text-2xl">Más allá del código</p>
                  <p className="text-[#A3CEF1] text-sm mt-1">Deportes, arte y cultura en nuestra comunidad</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { titulo: "Club de Programación", desc: "Reuniones semanales, competencias y proyectos open source." },
                { titulo: "Centro de estudiantes", desc: "Representación activa. Alumnos que lideran." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white rounded-sm p-6 border border-[#c0cdd7] hover:border-[#274C77] transition-colors cursor-pointer group"
                >
                  <h3 className="font-display font-bold text-lg group-hover:text-[#274C77] transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-[#8B8C89] text-sm mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PASANTÍAS - Componente Empresas mapeando GET /empresas */}
      <Empresas />
            <section className="relative overflow-hidden bg-[#274C77] text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#A3CEF1 1px, transparent 1px), linear-gradient(90deg, #A3CEF1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-mono-code text-[#A3CEF1] text-xs mb-3">// pasantías</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight mb-3">
              ¿Te Interesa<br />Aceptar Pasantes?
            </h2>
            <p className="text-[#A3CEF1]/80 text-lg">Si tenés o conocés una empresa a la que le interesaría aceptar pasantes contactate con nosotros.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <a
              href="#"
              className="bg-[#A3CEF1] text-[#274C77] font-bold px-8 py-4 rounded-sm hover:bg-white transition-colors text-center"
            >
              Contacto
            </a>
            <a
              href="#"
              className="border border-[#A3CEF1]/40 text-white font-bold px-8 py-4 rounded-sm hover:border-[#A3CEF1] transition-colors text-center"
            >
              Más información
            </a>
          </div>
        </div>
      </section>
    </>
    
  );
}
