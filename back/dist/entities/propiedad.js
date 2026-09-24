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
exports.Propiedad = void 0;
const typeorm_1 = require("typeorm");
const inmobiliaria_1 = require("./inmobiliaria");
const enums_1 = require("./enums");
let Propiedad = class Propiedad {
    id;
    title;
    description;
    type;
    operation;
    price;
    currency;
    address;
    area;
    coveredAreaM2;
    totalAreaM2;
    rooms;
    bedrooms;
    bathrooms;
    ageYears;
    tags;
    status;
    agency;
    createdAt;
    updatedAt;
};
exports.Propiedad = Propiedad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Propiedad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 160 }),
    __metadata("design:type", String)
], Propiedad.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Propiedad.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.PropertyType }),
    __metadata("design:type", String)
], Propiedad.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.OperationType }),
    __metadata("design:type", String)
], Propiedad.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 14, scale: 2 }),
    __metadata("design:type", String)
], Propiedad.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 3 }),
    __metadata("design:type", String)
], Propiedad.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Propiedad.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], Propiedad.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Propiedad.prototype, "coveredAreaM2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", String)
], Propiedad.prototype, "totalAreaM2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", nullable: true }),
    __metadata("design:type", Object)
], Propiedad.prototype, "rooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", nullable: true }),
    __metadata("design:type", Object)
], Propiedad.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", nullable: true }),
    __metadata("design:type", Object)
], Propiedad.prototype, "bathrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", nullable: true }),
    __metadata("design:type", Object)
], Propiedad.prototype, "ageYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", default: "" }),
    __metadata("design:type", Array)
], Propiedad.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.PropertyStatus, default: enums_1.PropertyStatus.DRAFT }),
    __metadata("design:type", String)
], Propiedad.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmobiliaria_1.Inmobiliaria, { nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "agency_id" }),
    __metadata("design:type", inmobiliaria_1.Inmobiliaria)
], Propiedad.prototype, "agency", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Propiedad.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Propiedad.prototype, "updatedAt", void 0);
exports.Propiedad = Propiedad = __decorate([
    (0, typeorm_1.Entity)("properties")
], Propiedad);
//# sourceMappingURL=propiedad.js.map