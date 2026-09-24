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

        {/* Fases del plan de estudios */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              año: "1.°, 2.° y 3.° año",
              titulo: "Fundamentos",
              items: ["Lógica y algoritmos", "Taller de Inglés Aplicado", "Scratch", "Pseint", "Educación Tecnológica", "LibreCAD y AutoCAD", "Fundamentos de Python", "Arduino y robótica"],
            },
            {
              año: "4.° y 5.° año",
              titulo: "Desarrollo Web",
              items: ["HTML y CSS", "Javascript", "Excel", "Diseño de Interfaces"],
            },
            {
              año: "6.° año",
              titulo: "Desarrollo",
              items: ["Bases de datos SQL","Vue.js", "Control de Versiones Git", "Principios del desarrollo Backend"],
            },
            {
              año: "7.° año",
              titulo: "Pasantías",
              items: ["Pasantías", "Inserción al mercado laboral", "Simulación de Entrevista Laboral y desarrollo de Curriculum Vitae", "Elaboración de Charla TED"],
            }
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
