const DESARROLLADORES = ["Vicente Cuevas", "Benjamín López"];

/* Antes: nosotros.html. Es una vista estática; lo único dinámico es la
   lista de desarrolladores, que ahora sale de un arreglo. */
function Nosotros() {
    return (
        <div className="description-container">
            <h1>Sobre nosotros Kateyes</h1>
            <p>
                Somos una empresa dedicada a la venta de cosméticos de alta calidad para mujeres,
                enfocándonos en ofrecer productos que sean <strong>accesibles</strong>, <strong>de calidad</strong>,
                y <strong>no testeados en animales</strong>. Nuestros productos están diseñados para realzar
                la belleza natural de nuestras clientas, proporcionando una experiencia única y
                confiable en el cuidado de la piel y el maquillaje.
            </p>
            <div>
                <p>Esta página web fue diseñada por los desarrolladores asociados:</p>
                <div className="developer-names">
                    {DESARROLLADORES.map(nombre => (
                        <span key={nombre}>{nombre}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Nosotros;
