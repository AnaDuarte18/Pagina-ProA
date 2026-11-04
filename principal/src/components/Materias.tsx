import { useNavigate } from "react-router-dom";
import { MATERIAS } from "@/mocks/materias.mock";
import Empresas from "@/components/Empresas";

export default function Materias() {
  const navigate = useNavigate();
  const materias = MATERIAS;

  return (
    <>
      {/* Áreas de conocimiento */}
      {/*El contenido de las tarjetas materias se encuentra dentro de materiaas.mock.ts */}
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
              className="p-7 border border-[#c0cdd7] rounded-sm bg-white relative overflow-hidden"
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
              <h3 className="font-display font-bold text-xl mb-2 text-[#274C77]">
                {m.nombre}
              </h3>
              <p className="text-[#8B8C89] text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PASANTÍAS - Componente Empresas */}
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
            <p className="text-[#A3CEF1]/80 text-lg">
              Si tenés o conocés una empresa a la que le interesaría aceptar pasantes contactate con nosotros.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button
              onClick={() => navigate("/contacto")}
              className="bg-[#A3CEF1] text-[#274C77] font-bold px-8 py-4 rounded-sm hover:bg-white transition-colors text-center"
            >
              Contacto
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
