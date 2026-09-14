import logoProa from "@/imports/image.png";
import { useEventos } from "@/hooks/useEventos";
import { TAG_COLORS } from "@/data/constants";

function EventosSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-start gap-5 p-5 border border-white/10 rounded-sm animate-pulse"
        >
          <div className="shrink-0 w-12 flex flex-col items-center gap-1">
            <div className="h-2 w-8 bg-white/20 rounded" />
            <div className="h-7 w-8 bg-white/20 rounded" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 bg-white/20 rounded w-3/4" />
            <div className="h-2 bg-white/20 rounded w-1/4" />
          </div>
          <div className="h-5 w-16 bg-white/20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function Calendario() {
  const { data: eventos, loading, error } = useEventos();

  return (
    <section className="bg-[#274C77] text-white">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-start">
        {/* Lista de eventos */}
        <div>
          <p className="font-mono-code text-[#A3CEF1] text-xs mb-2">// calendar.push(evento)</p>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-10">
            Próximos<br />eventos
          </h2>

          {loading && <EventosSkeleton />}

          {error && (
            <div className="border border-red-400/40 bg-red-900/20 rounded-sm p-6 text-center">
              <p className="font-mono-code text-red-300 text-xs mb-1">// error al cargar eventos</p>
              <p className="text-red-200 text-sm">{error.message}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-4">
              {eventos.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-5 p-5 border border-white/10 rounded-sm hover:border-[#A3CEF1]/40 transition-colors cursor-pointer group"
                >
                  <div className="shrink-0 text-center w-12">
                    <p className="font-mono-code text-[#A3CEF1] text-xs font-bold">{e.mes}</p>
                    <p className="font-display font-black text-3xl leading-none">{e.dia}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-snug group-hover:text-[#A3CEF1] transition-colors">
                      {e.nombre}
                    </p>
                    <p className="font-mono-code text-[#8B8C89] text-xs mt-1">{e.hora}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      TAG_COLORS[e.tipo] || "bg-white/10 text-white"
                    }`}
                  >
                    {e.tipo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel con imagen y frase */}
        <div className="relative rounded-sm overflow-hidden bg-[#0d1b2a] h-full min-h-[420px] flex flex-col justify-between">
          <img
            src="https://images.unsplash.com/photo-1613896527026-f195d5c818ed?w=800&h=500&fit=crop&auto=format"
            alt="Edificio PRoA San Francisco"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative p-8 flex-1 flex flex-col justify-end">
            <div className="mb-6">
              <img src={logoProa} alt="Logo PRoA" className="h-20 w-20 object-contain opacity-90" />
            </div>
            <p className="font-display text-2xl font-bold text-white leading-snug">
              "El código que escribís hoy<br />es el producto de mañana."
            </p>
            <p className="font-mono-code text-[#8B8C89] text-xs mt-3">
              — Dirección pedagógica, PRoA San Francisco
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
