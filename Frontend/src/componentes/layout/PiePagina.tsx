import Link from "next/link";

export const PiePagina = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-fluid-xs text-muted">
          <div>
            <p>© {currentYear} Oasis Aura. Todos los derechos reservados.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-text transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-text transition-colors">
              Términos
            </Link>
            <Link href="/contacto" className="hover:text-text transition-colors">
              Contacto
            </Link>
          </div>
          
          <div className="flex items-center gap-1 font-medium">
            <span>Hecho con</span>
            <span className="text-accent" aria-label="amor">❤</span>
            <span>en México</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
