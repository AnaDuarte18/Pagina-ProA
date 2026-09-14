import { STACK } from "@/data/constants";

export default function OrientacionPrincipal() {
  return (
    <section id="programacion" className="bg-[#0d1b2a] text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-mono-code text-[#6096BA] text-xs mb-2">// orientación principal</p>
            <h2 className="font-display text-4xl md:text-5xl font-black">
              Programación<br />
              <span className="text-[#A3CEF1]">desde el primer año</span>
            </h2>
          </div>
          <p className="text-[#8B8C89] max-w-sm text-sm leading-relaxed">
            No es un taller optativo. La programación es el eje central de nuestra propuesta educativa,
            integrada a todas las materias.
          </p>
        </div>

        {/* Stack de tecnologías */}
        <div className="flex flex-wrap gap-3 mb-14">
          {STACK.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm px-4 py-2 hover:border-[#6096BA]/50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="font-mono-code text-sm text-[#A3CEF1]">{s.name}</span>
            </div>
          ))}
        </div>

        {/* Fases del plan de estudios */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              año: "1.° y 2.° año",
              titulo: "Fundamentos",
              items: ["Lógica y algoritmos", "Python básico e intermedio", "Introducción a la web", "Control de versiones con Git"],
            },
            {
              año: "3.° y 4.° año",
              titulo: "Desarrollo",
              items: ["JavaScript & React", "Bases de datos SQL", "Arduino y robótica", "Proyectos colaborativos"],
            },
            {
              año: "5.° año",
              titulo: "Proyecto final",
              items: ["Desarrollo de producto completo", "Seguridad y testing", "Demo Day público", "Vinculación con empresas"],
            },
          ].map((fase, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-6 hover:border-[#6096BA]/40 transition-colors">
              <p className="font-mono-code text-[#6096BA] text-xs mb-1">{fase.año}</p>
              <h3 className="font-display font-bold text-xl text-white mb-4">{fase.titulo}</h3>
              <ul className="flex flex-col gap-2">
                {fase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#A3CEF1]/80">
                    <span className="font-mono-code text-[#6096BA] text-xs">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
