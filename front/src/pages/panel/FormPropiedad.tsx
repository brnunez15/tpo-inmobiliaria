/**
 *
 *   - POST /properties
 *   - PUT /properties/:id
 *
 *   [ ] 1. desdePropiedad  (función auxiliar)
 *         function desdePropiedad(p: PropertyDetail): Formulario
 *   [ ] 2. validar  (función auxiliar)
 *         function validar(f: Formulario): Errores
 *         → Mismas reglas que el back (que igual las valida): acá solo se evita el viaje y se marca el campo.
 *   [ ] 3. aNumeroONull  (función auxiliar)
 *         function aNumeroONull(texto: string): number | null
 *   [ ] 4. FormPropiedad  (componente (export default))
 *         export default function FormPropiedad()
 *         → Alta (/panel/propiedades/nueva) y edición (/panel/propiedades/:id/editar) comparten este formulario.
 *   [ ] 5. cambiar  (método interno)
 *         function cambiar(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)
 *   [ ] 6. alternarTag  (método interno)
 *         function alternarTag(tag: string)
 *   [ ] 7. cambiarImagen  (método interno)
 *         function cambiarImagen(indice: number, url: string)
 *   [ ] 8. handleSubmit  (método interno)
 *         async function handleSubmit(e: FormEvent<HTMLFormElement>)
 */
export {};
