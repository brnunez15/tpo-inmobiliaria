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
exports.Reseña = void 0;
const typeorm_1 = require("typeorm");
const inmobiliaria_1 = require("./inmobiliaria");
let Reseña = class Reseña {
    id;
    authorName;
    content;
    rating;
    agency;
    createdAt;
};
exports.Reseña = Reseña;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reseña.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], Reseña.prototype, "authorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Reseña.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint" }),
    __metadata("design:type", Number)
], Reseña.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmobiliaria_1.Inmobiliaria, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "agency_id" }),
    __metadata("design:type", inmobiliaria_1.Inmobiliaria)
], Reseña.prototype, "agency", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Reseña.prototype, "createdAt", void 0);
exports.Reseña = Reseña = __decorate([
    (0, typeorm_1.Entity)("reviews")
], Reseña);
//# sourceMappingURL=historial-rese%C3%B1as.js.map