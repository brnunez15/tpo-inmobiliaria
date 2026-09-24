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
exports.GaleriaImagen = void 0;
const typeorm_1 = require("typeorm");
const propiedad_1 = require("./propiedad");
let GaleriaImagen = class GaleriaImagen {
    id;
    url;
    position;
    isCover;
    property;
};
exports.GaleriaImagen = GaleriaImagen;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GaleriaImagen.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500 }),
    __metadata("design:type", String)
], GaleriaImagen.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", default: 0 }),
    __metadata("design:type", Number)
], GaleriaImagen.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], GaleriaImagen.prototype, "isCover", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => propiedad_1.Propiedad, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "property_id" }),
    __metadata("design:type", propiedad_1.Propiedad)
], GaleriaImagen.prototype, "property", void 0);
exports.GaleriaImagen = GaleriaImagen = __decorate([
    (0, typeorm_1.Entity)("property_images")
], GaleriaImagen);
//# sourceMappingURL=galeria-imagenes.js.map