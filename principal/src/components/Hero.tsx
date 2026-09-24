import { CODE_SNIPPET} from "@/data/constants";

function CodeWindow({ code }: { code: string }) {
  return (
    <div className="rounded-sm overflow-hidden border border-[#A3CEF1]/30 shadow-xl bg-[#0d1b2a]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a3050] border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-[#A3CEF1] font-mono-code">main.py — PRoA</span>
      </div>
      <pre className="p-5 text-sm leading-relaxed font-mono-code text-[#A3CEF1] overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface HeroProps {
  onNavigate: (page: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#274C77]">
      {/* Grid de fondo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#A3CEF1 1px, transparent 1px), linear-gradient(90deg, #A3CEF1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#274C77] via-[#274C77]/90 to-[#6096BA]/40" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center w-full">
        {/* Texto */}
        <div>
          <h1 className="font-display text-5xl md:text-7xl text-white font-black leading-[0.9] mb-6">
            Aprendé a<br />
            <em className="not-italic text-[#A3CEF1]">construir</em><br />
            el futuro
          </h1>
          <p className="text-[#A3CEF1]/80 text-lg leading-relaxed max-w-md mb-8">
            La única escuela ProA de modalidad Técnica la encontras en San Francisco.
            Egresás con habilidades reales del siglo XXI y mucho más.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              { valor: "7", label: "años de cursada" },
              { valor: "250+", label: "egresados" },
              { valor: "14+", label: "materias de especialidad" },
            ].map(({ valor, label }) => (
              <div key={label} className="border border-white/10 bg-white/5 rounded-sm p-4 text-center">
                <p className="font-display font-black text-3xl text-white">{valor}</p>
                <p className="text-[#A3CEF1]/70 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Code window */}
        <div className="hidden md:block">
          <CodeWindow code={CODE_SNIPPET} />
        </div>
      </div>
    </section>
  );
}
