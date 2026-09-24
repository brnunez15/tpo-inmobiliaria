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
exports.HistorialEstadoPropiedad = void 0;
const typeorm_1 = require("typeorm");
const propiedad_1 = require("./propiedad");
const enums_1 = require("./enums");
let HistorialEstadoPropiedad = class HistorialEstadoPropiedad {
    id;
    fromStatus;
    toStatus;
    property;
    createdAt;
};
exports.HistorialEstadoPropiedad = HistorialEstadoPropiedad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HistorialEstadoPropiedad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.PropertyStatus }),
    __metadata("design:type", String)
], HistorialEstadoPropiedad.prototype, "fromStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.PropertyStatus }),
    __metadata("design:type", String)
], HistorialEstadoPropiedad.prototype, "toStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => propiedad_1.Propiedad, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "property_id" }),
    __metadata("design:type", propiedad_1.Propiedad)
], HistorialEstadoPropiedad.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HistorialEstadoPropiedad.prototype, "createdAt", void 0);
exports.HistorialEstadoPropiedad = HistorialEstadoPropiedad = __decorate([
    (0, typeorm_1.Entity)("property_status_history")
], HistorialEstadoPropiedad);
//# sourceMappingURL=historial-estado-propiedad.js.map