import { useNavigate } from "react-router-dom";
import type { NovedadBackendItem } from "@/types";

function formatFecha(fecha?: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface NovedadCardProps {
  novedad: NovedadBackendItem;
  className?: string;
}

export default function NovedadCard({ novedad, className = "" }: NovedadCardProps) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/novedades/${novedad.ID}`)}
      className={`group bg-white rounded-lg overflow-hidden border border-[#c0cdd7] hover:border-[#6096BA] hover:shadow-md transition-all cursor-pointer ${className}`}
    >
      {/* Imagen */}
      <div className="aspect-[16/10] overflow-hidden bg-[#dae4ec]">
        {novedad.imagen ? (
          <img
            src={novedad.imagen}
            alt={novedad.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#274C77]/10 to-[#6096BA]/20">
            <svg className="w-12 h-12 text-[#6096BA]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {novedad.asignaturaNombre && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {novedad.asignaturaNombre}
            </span>
          )}
          <span className="text-xs text-[#8B8C89]">
            {formatFecha(novedad.fecha_publicacion || novedad.fechaDeCreacion)}
          </span>
        </div>
        <h3 className="font-bold text-base leading-snug text-[#0d1b2a] group-hover:text-[#274C77] transition-colors line-clamp-3 break-words [overflow-wrap:anywhere]">
          {novedad.titulo}
        </h3>
        {novedad.autorNombre && (
          <p className="text-xs text-[#8B8C89] mt-2 truncate">Por {novedad.autorNombre}</p>
        )}
      </div>
    </article>
  );
}
