/**
 * Valida la cantidad máxima de decimales de un número.
 * `decimalesValidator(0)` exige enteros; `decimalesValidator(2)` admite hasta dos.
 */
export function decimalesValidator(maxDecimales) {
    return (control) => {
        const valor = control.value;
        if (valor === null || valor === undefined || valor === '')
            return null;
        const texto = String(valor);
        // Si no es un decimal simple, lo resuelven los demás validadores (min, max, etc.).
        if (!/^\d+(\.\d+)?$/.test(texto))
            return null;
        const fraccion = texto.split('.')[1] ?? '';
        return fraccion.length <= maxDecimales
            ? null
            : { decimales: { max: maxDecimales, actual: fraccion.length } };
    };
}
