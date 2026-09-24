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
exports.Inmobiliaria = void 0;
const typeorm_1 = require("typeorm");
const vendedor_1 = require("./vendedor");
let Inmobiliaria = class Inmobiliaria {
    id;
    name;
    description;
    logoUrl;
    contactPhone;
    contactEmail;
    officeAddress;
    seller;
    createdAt;
};
exports.Inmobiliaria = Inmobiliaria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Inmobiliaria.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 120 }),
    __metadata("design:type", String)
], Inmobiliaria.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Inmobiliaria.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true, length: 500 }),
    __metadata("design:type", Object)
], Inmobiliaria.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40 }),
    __metadata("design:type", String)
], Inmobiliaria.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Inmobiliaria.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true, length: 255 }),
    __metadata("design:type", Object)
], Inmobiliaria.prototype, "officeAddress", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => vendedor_1.Vendedor, { nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "seller_id" }),
    __metadata("design:type", vendedor_1.Vendedor)
], Inmobiliaria.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Inmobiliaria.prototype, "createdAt", void 0);
exports.Inmobiliaria = Inmobiliaria = __decorate([
    (0, typeorm_1.Entity)("agencies")
], Inmobiliaria);
//# sourceMappingURL=inmobiliaria.js.map