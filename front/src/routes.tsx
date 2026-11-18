/**
 *
 * A ESCRIBIR — el árbol de rutas:
 *
 *   [ ] Zona pública (Interesado, sin cuenta) — element: LayoutPublico
 *         "/"                    → Listado
 *         "/propiedades/:id"     → Detalle
 *         "/inmobiliarias/:id"   → Sitio
 *         "*"                    → NoEncontrado   (cualquier otra URL)
 *
 *   [ ] Autenticación (sin layout)
 *         "/ingresar"            → Login
 *         "/registro"            → Registro
 *
 *   [ ] Zona del vendedor — element: RequireAuth (la guardia) y adentro LayoutPanel en "/panel"
 *         index                  → redirige a "propiedades"   (Navigate)
 *         "propiedades"          → MisPropiedades
 *         "propiedades/nueva"    → FormPropiedad
 *         "propiedades/:id/editar" → FormPropiedad   (el mismo formulario, en modo edición)
 *         "visitas"              → Visitas
 *         "consultas"            → Consultas
 *         "actividad"            → Actividad
 *         "reportes"             → Reportes
 *         "inmobiliaria"         → MiInmobiliaria
 */
export {};
