export default function Contacto() {
  return (
    <div className="bg-[#E7ECEF] min-h-[calc(100vh-4rem)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera de Contacto */}
        <div className="bg-[#274C77] text-white rounded-t-xl p-8 md:p-12 shadow-md">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Canales de comunicación oficiales
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Contactate con <span className="text-[#A3CEF1]">Escuela PRoA</span>
          </h1>
          <p className="text-[#E7ECEF]/90 max-w-2xl text-sm md:text-base leading-relaxed">
            Estamos a tu disposición para responder dudas académicas, consultas de preinscripción,
            trámites de secretaría o proyectos interinstitucionales.
          </p>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-b-xl p-8 md:p-12 shadow-lg border-x border-b border-[#8B8C89]/20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Información y Redes Sociales */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#274C77] mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6096BA]"></span>
                Medios de Contacto
              </h2>
              <div className="space-y-4 text-sm">
                {/* Correo */}
                <div className="p-4 rounded-lg bg-[#E7ECEF]/60 border border-[#8B8C89]/20 hover:border-[#6096BA] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-md bg-[#274C77] text-white flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-[#274C77]">Correo Electrónico</span>
                  </div>
                  <p className="text-[#0d1b2a] font-mono-code text-xs ml-11">contacto@escuelasproa.edu.ar</p>
                  <p className="text-[#8B8C89] font-mono-code text-xs ml-11">alumnos@escuelasproa.edu.ar</p>
                </div>

                {/* Teléfono */}
                <div className="p-4 rounded-lg bg-[#E7ECEF]/60 border border-[#8B8C89]/20 hover:border-[#6096BA] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-md bg-[#274C77] text-white flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="font-bold text-[#274C77]">Teléfono & WhatsApp</span>
                  </div>
                  <p className="text-[#0d1b2a] text-xs ml-11">+54 (3564) 43-9000</p>
                  <p className="text-[#8B8C89] text-xs ml-11">Lun a Vie: 07:30 a 17:30 hs</p>
                </div>

                {/* Ubicación */}
                <div className="p-4 rounded-lg bg-[#E7ECEF]/60 border border-[#8B8C89]/20 hover:border-[#6096BA] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-md bg-[#274C77] text-white flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-bold text-[#274C77]">Sede Institucional</span>
                  </div>
                  <p className="text-[#0d1b2a] text-xs ml-11">Av. de la Universidad y Güemes</p>
                  <p className="text-[#8B8C89] text-xs ml-11">San Francisco, Córdoba, Argentina</p>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <h2 className="text-xl font-bold text-[#274C77] mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6096BA]"></span>
                Redes Sociales Oficiales
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#8B8C89]/30 bg-white hover:bg-[#A3CEF1]/20 hover:border-[#6096BA] text-[#274C77] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6096BA]/20 text-[#274C77] flex items-center justify-center group-hover:bg-[#274C77] group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Instagram</p>
                    <p className="text-[11px] text-[#8B8C89]">@proasanfco</p>
                  </div>
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#8B8C89]/30 bg-white hover:bg-[#A3CEF1]/20 hover:border-[#6096BA] text-[#274C77] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6096BA]/20 text-[#274C77] flex items-center justify-center group-hover:bg-[#274C77] group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Facebook</p>
                    <p className="text-[11px] text-[#8B8C89]">/EscuelaProaSanFco</p>
                  </div>
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#8B8C89]/30 bg-white hover:bg-[#A3CEF1]/20 hover:border-[#6096BA] text-[#274C77] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6096BA]/20 text-[#274C77] flex items-center justify-center group-hover:bg-[#274C77] group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">YouTube</p>
                    <p className="text-[11px] text-[#8B8C89]">Canal Institucional</p>
                  </div>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#8B8C89]/30 bg-white hover:bg-[#A3CEF1]/20 hover:border-[#6096BA] text-[#274C77] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6096BA]/20 text-[#274C77] flex items-center justify-center group-hover:bg-[#274C77] group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">LinkedIn</p>
                    <p className="text-[11px] text-[#8B8C89]">Comunidad PRoA</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
