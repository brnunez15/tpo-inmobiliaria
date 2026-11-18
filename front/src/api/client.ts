/**
 * src/api/client.ts
 *
 * PARA QUÉ SIRVE: (escribilo con tus palabras cuando termines)
 *
 * A ESCRIBIR:
 *   [ ] 1. FieldIssue  (interface)
 *         export interface FieldIssue
 *   [ ] 2. ApiError  (class)
 *         export class ApiError
 *         → Error de la API (o de red, con status 0). Lleva el mensaje listo para mostrar.
 *   [ ] 3. QueryValue  (type)
 *         export type QueryValue
 *   [ ] 4. toQuery  (función)
 *         export function toQuery(params: Record<string, QueryValue>): string
 *         → { a: 1, b: "", c: undefined } → "?a=1" (los vacíos no se mandan).
 *   [ ] 5. apiFetch  (función)
 *         export async function apiFetch<T>(path: string, options: Options = {}): Promise<T>
 *   [ ] 6. toApiError  (función)
 *         export function toApiError(error: unknown): ApiError
 *         → Convierte cualquier cosa que se haya tirado en un ApiError listo para mostrar.
 *   [ ] 7. fieldErrors  (función)
 *         export function fieldErrors(error: ApiError): Record<string, string>
 *         → { campo: "mensaje" } a partir de los `details` de un 400 (path[0] es el campo).
 */
export {};
