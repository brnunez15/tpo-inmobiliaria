"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Actividad = void 0;
const typeorm_1 = require("typeorm");
const inmobiliaria_1 = require("./inmobiliaria");
const historial_comentarios_1 = require("./historial-comentarios");
const historial_rese_as_1 = require("./historial-rese\u00F1as");
const visitas_1 = require("./visitas");
const propiedad_1 = require("./propiedad");
const enums_1 = require("./enums");
let Actividad = class Actividad {
    id;
    type;
    read;
    // Dueña del feed: siempre presente, es sobre quién se filtra en
    // GET /agencies/:id/activity.
    agency;
    // Solo una de estas cuatro va a estar cargada, según "type".
    // Las cuatro son opcionales (nullable: true) por eso.
    property;
    comment;
    visitRequest;
    review;
    createdAt;
};
exports.Actividad = Actividad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Actividad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.ActivityType }),
    __metadata("design:type", String)
], Actividad.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Actividad.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmobiliaria_1.Inmobiliaria, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "agency_id" }),
    __metadata("design:type", inmobiliaria_1.Inmobiliaria)
], Actividad.prototype, "agency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => propiedad_1.Propiedad, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "property_id" }),
    __metadata("design:type", Object)
], Actividad.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => historial_comentarios_1.Comentario, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "comment_id" }),
    __metadata("design:type", Object)
], Actividad.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visitas_1.SolicitudVisita, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "visit_request_id" }),
    __metadata("design:type", Object)
], Actividad.prototype, "visitRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => historial_rese_as_1.Reseña, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "review_id" }),
    __metadata("design:type", Object)
], Actividad.prototype, "review", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Actividad.prototype, "createdAt", void 0);
exports.Actividad = Actividad = __decorate([
    (0, typeorm_1.Entity)("activities")
], Actividad);
//# sourceMappingURL=actividad.js.map