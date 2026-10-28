/* Un campo de formulario: etiqueta + control + mensaje de error.
   En el HTML este bloque se repetía para cada campo (con su
   <div id="error-..."> aparte). Aquí se escribe una vez y se reutiliza
   en checkout, contacto y (más adelante) login y registro.

   Es un componente "controlado": no guarda el valor, lo recibe por props
   (valor) y avisa cada cambio (onChange). El que manda es el formulario.

   Props:
   - id, nombre:  id del control y atributo name (el name es la clave del dato)
   - etiqueta:    texto del <label>
   - valor, onChange, onBlur
   - error:       texto del error ("" si no hay)
   - tipo:        "text" por defecto; "textarea" dibuja un <textarea>;
                  "select" dibuja un <select> con las <option> que le pases como hijos
   - clase:       clases del contenedor (por defecto "mb-3")
   - ayuda:       contenido extra bajo el control (p. ej. un contador de caracteres)
   - ...resto:    cualquier otro atributo (maxLength, autoComplete, placeholder, rows) */
function CampoFormulario({
    id,
    nombre,
    etiqueta,
    valor,
    error,
    onChange,
    onBlur,
    tipo = "text",
    clase = "mb-3",
    ayuda,
    children,
    ...resto
}) {
    const idError = `error-${id}`;

    // Atributos comunes a <input> y <textarea>
    const propiedades = {
        id,
        name: nombre,
        className: `${tipo === "select" ? "form-select" : "form-control"} ${error ? "is-invalid" : ""}`,
        value: valor,
        onChange,
        onBlur,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? idError : undefined,
        ...resto,
    };

    return (
        <div className={clase}>
            <label htmlFor={id} className="form-label">{etiqueta}</label>
            {tipo === "textarea" ? <textarea {...propiedades} />
                : tipo === "select" ? <select {...propiedades}>{children}</select>
                : <input type={tipo} {...propiedades} />}
            {ayuda}
            {/* Bootstrap muestra .invalid-feedback cuando un control hermano anterior tiene .is-invalid */}
            <div className="invalid-feedback" id={idError}>{error}</div>
        </div>
    );
}

export default CampoFormulario;
