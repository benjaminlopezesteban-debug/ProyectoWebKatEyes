/* src/blogs.js — entradas del blog (datos, sin React).
   Blog1.html y Blog2.html eran dos páginas con la MISMA estructura y distinto
   contenido. En React eso es una sola vista (views/Blog.jsx) que se llena
   con estos datos según la URL: /blogs/primavera-tez-clara, /blogs/temporada-descuentos.

   El contenido es un arreglo de "bloques" (en vez de un único texto largo):
   - { tipo: "titulo",  texto }
   - { tipo: "parrafo", texto }
   - { tipo: "lista",   items: [{ etiqueta, texto }] }
   Así cada parte se dibuja con su propia etiqueta HTML. */

const BLOGS = [
    {
        slug: "primavera-tez-clara",
        titulo: "Un toque de primavera para tez clara",
        imagen: "Labial Mate Rosa Nude.jpg",
        resumen:
            "Con la llegada de los días más luminosos y las mañanas templadas, mantener un aspecto fresco en la oficina sin recargar la piel se vuelve un todo un desafío. " +
            "Esta semana estuve probando el labial orgánico de la línea eco-beauty de Flora & Botanical, en su tono Peach Sunrise, y debo decir que superó mis expectativas.",
        contenido: [
            {
                tipo: "parrafo",
                texto:
                    "Para quienes tenemos la piel muy blanca, encontrar un labial de tono cálido que no luzca chillón o demasiado anaranjado suele ser complicado. " +
                    "El tono Peach Sunrise es un durazno suave con destellos coral muy sutiles. " +
                    "Apenas lo apliqué, noté cómo aporta luz de inmediato, dando ese efecto \"cara de descansada\" tan necesario a las 9:00 AM.",
            },
            {
                tipo: "parrafo",
                texto:
                    "Su acabado es satinado, ideal para esta época del año en la que dejamos atrás los tonos mate profundos del invierno y buscamos texturas más livianas y jugosas.",
            },
            { tipo: "titulo", texto: "Compromiso ecológico sin perder calidad" },
            {
                tipo: "parrafo",
                texto:
                    "Uno de los puntos que más me impulsó a probarlo fue su formulación. " +
                    "Es un producto 100% vegano, libre de crueldad animal y certificado orgánico, elaborado a base de manteca de karité y aceite de jojoba.",
            },
            {
                tipo: "parrafo",
                texto:
                    "El empaque también merece una mención especial: viene en un tubo de cartón biodegradado y prensado, " +
                    "bastante resistente para andar trayéndolo en el banano o en la cartera del trabajo, reduciendo al mínimo el uso de plásticos de un solo uso.",
            },
            { tipo: "titulo", texto: "Desempeño en el día a día laboral" },
            {
                tipo: "lista",
                items: [
                    {
                        etiqueta: "Textura y aplicación",
                        texto:
                            "Corre increíblemente bien. Al tener ingredientes nutritivos, se siente casi como un bálsamo hidratante. " +
                            "No genera los molestos cueritos ni se junta en las pliegues de los labios.",
                    },
                    {
                        etiqueta: "Duración",
                        texto:
                            "Al ser un labial natural y humectante, no es de fijación indeleble. " +
                            "Aguanta perfecto el primer café de la mañana, pero requiere un retoque liviano después de almorzar.",
                    },
                    {
                        etiqueta: "Sensación",
                        texto:
                            "A diferencia de otros labiales que se resecan con el aire acondicionado de la oficina, este mantiene la hidratación durante horas.",
                    },
                ],
            },
            { tipo: "titulo", texto: "El veredicto" },
            {
                tipo: "parrafo",
                texto:
                    "Si tienes la piel clara y buscas un aliado para equilibrar el look de oficina en estos días de sol " +
                    "—sin cargarte de maquillaje y aportando al cuidado del medio ambiente—, este labial es un acierto total. " +
                    "Es cómodo, bonito y aporta ese color primaveral justo para refrescar el rostro antes de entrar a la primera reunión del día.",
            },
            { tipo: "parrafo", texto: "Calificación: 4.8 / 5" },
        ],
    },
    {
        slug: "temporada-descuentos",
        titulo: "Temporada De Descuentos!",
        imagen: "Crema Hidratante Facial.jpg",
        resumen: "Descuentos en productos seleccionados durante todo el mes de Octubre, no te lo pierdas.",
        contenido: [
            {
                tipo: "parrafo",
                texto: "Descuentos en productos seleccionados durante todo el mes de Octubre, no te lo pierdas.",
            },
        ],
    },
];

export function obtenerBlogs() {
    return [...BLOGS];
}

export function obtenerBlogPorSlug(slug) {
    return BLOGS.find(b => b.slug === slug) ?? null;
}
