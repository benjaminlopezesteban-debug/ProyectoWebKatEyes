/* Antes: components/footer.html. No tiene props ni estado: es un componente
   "estático", el más simple posible. */
function Footer() {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-main">
                    <strong className="footer-brand">Kateyes</strong>
                    <span>Los mejores productos al mejor precio</span>
                    <span>contacto@kateyes.cl</span>
                    <span>+1 234 567 890</span>
                </div>

                {/* Íconos: antes "fab fa-*" (Font Awesome, que nunca se cargaba).
                    Ahora usan Bootstrap Icons, que ya está instalado. */}
                <div className="footer-social">
                    <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                    <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                    <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
                </div>
            </div>

            <div className="copyright">
                {/* El año se calcula solo, ya no hay que editarlo cada enero */}
                <p>&copy; {new Date().getFullYear()} Kateyes. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;
