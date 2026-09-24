import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import type { NotificacionItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function NotificacionesBox() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter((n) => !n.fechaLeida).length;

  const fetchNotificaciones = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/notificaciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data);
      } else {
        // Fallback local en desarrollo
        setNotificaciones(getMockNotificaciones(user?.name || "Docente"));
      }
    } catch {
      setNotificaciones(getMockNotificaciones(user?.name || "Docente"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [token]);

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch(`${BASE}/notificaciones/${id}/leida`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // ignore
    }
    setNotificaciones((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, fechaLeida: new Date().toISOString() } : n))
    );
  };

  // Cerrar al click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotificaciones();
        }}
        className="relative p-2 rounded-full text-[#A3CEF1] hover:text-white hover:bg-white/10 transition-colors"
        title="Notificaciones"
        aria-label="Caja de notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-mono-code text-[10px] font-bold rounded-full flex items-center justify-center border border-[#274C77]">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white text-[#0d1b2a] rounded-lg shadow-2xl border border-[#8B8C89]/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-[#8B8C89]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6096BA]"></span>
              <h3 className="font-bold text-xs text-[#274C77] uppercase tracking-wider">
                Notificaciones ({noLeidas} no leídas)
              </h3>
            </div>
            <button
              onClick={fetchNotificaciones}
              className="text-[11px] text-[#6096BA] hover:underline flex items-center gap-1"
            >
              Actualizar
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#8B8C89]/10">
            {loading ? (
              <div className="p-6 text-center text-xs text-[#8B8C89]">Cargando notificaciones...</div>
            ) : notificaciones.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8B8C89]">No tenés notificaciones pendientes.</div>
            ) : (
              notificaciones.map((notif) => {
                const esLeida = !!notif.fechaLeida;
                return (
                  <div
                    key={notif.ID}
                    className={`p-3.5 transition-colors ${
                      esLeida ? "bg-white text-[#8B8C89]" : "bg-[#E7ECEF]/50 text-[#0d1b2a]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-bold ${esLeida ? "text-[#8B8C89]" : "text-[#274C77]"}`}>
                        {notif.Titulo}
                      </p>
                      {!esLeida && (
                        <button
                          onClick={() => marcarComoLeida(notif.ID)}
                          className="text-[10px] text-[#6096BA] hover:text-[#274C77] hover:underline shrink-0"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#0d1b2a]/90 mt-1 leading-snug">{notif.mensaje}</p>
                    {notif.tipoNombre && (
                      <span className="inline-block mt-2 text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#A3CEF1]/30 text-[#274C77] font-semibold">
                        {notif.tipoNombre}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getMockNotificaciones(nombre: string): NotificacionItem[] {
  return [
    {
      ID: 101,
      Titulo: "Publicación Aprobada",
      mensaje: `Tu novedad "Taller de Robótica 2026" fue revisada y publicada por Administración.`,
      fechaLeida: null,
      tipoID: 1,
      tipoNombre: "Aprobación",
    },
    {
      ID: 102,
      Titulo: "Material Devuelto",
      mensaje: `El cuadernillo de Programación I requiere correcciones. Revisá el comentario del admin.`,
      fechaLeida: null,
      tipoID: 2,
      tipoNombre: "Devolución",
    },
    {
      ID: 103,
      Titulo: "Bienvenido/a al Sistema",
      mensaje: `Hola ${nombre}, tu cuenta está verificada y activa en el sistema PRoA.`,
      fechaLeida: "2026-09-15T10:00:00Z",
      tipoID: 4,
      tipoNombre: "Nueva publicación",
    },
  ];
}
