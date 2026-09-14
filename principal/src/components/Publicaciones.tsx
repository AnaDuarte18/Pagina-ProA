import { useNoticias } from "@/hooks/useNoticias";
import { TAG_COLORS } from "@/data/constants";

function NoticiasSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-sm overflow-hidden border border-[#c0cdd7] animate-pulse">
          <div className="aspect-[16/10] bg-[#dae4ec]" />
          <div className="p-6 flex flex-col gap-3">
            <div className="h-3 bg-[#dae4ec] rounded w-1/3" />
            <div className="h-4 bg-[#dae4ec] rounded w-full" />
            <div className="h-4 bg-[#dae4ec] rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Publicaciones() {
  const { data: noticias, loading, error } = useNoticias();

  return (
    <section id="noticias" className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="font-mono-code text-[#6096BA] text-xs mb-2">// últimas publicaciones</p>
          <h2 className="font-display text-4xl md:text-5xl font-black">
            Noticias<br />de la escuela
          </h2>
        </div>
        <a
          href="#"
          className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#274C77] hover:text-[#6096BA] transition-colors"
        >
          Ver todas →
        </a>
      </div>

      {loading && <NoticiasSkeleton />}

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-sm p-6 text-center">
          <p className="font-mono-code text-red-500 text-xs mb-1">// error al cargar noticias</p>
          <p className="text-red-700 text-sm">{error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-3 gap-8">
          {noticias.map((n, i) => (
            <article
              key={i}
              className="group bg-white rounded-sm overflow-hidden border border-[#c0cdd7] hover:border-[#6096BA] transition-colors cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#dae4ec]">
                <img
                  src={n.img}
                  alt={n.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[n.tag]}`}>
                    {n.tag}
                  </span>
                  <span className="text-xs text-[#8B8C89]">{n.fecha}</span>
                </div>
                <h3 className="font-display font-bold text-lg leading-snug group-hover:text-[#274C77] transition-colors">
                  {n.titulo}
                </h3>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
