import type { Request, Response } from "express";
declare class PropertyController {
    getById(request: Request, response: Response): Promise<void>;
    create(request: Request, response: Response): Promise<void>;
    update(request: Request, response: Response): Promise<void>;
    findAll(request: Request, response: Response): Promise<void>;
    patchStatus(request: Request, response: Response): Promise<void>;
    getStatusHistory(request: Request, response: Response): Promise<void>;
    createComment(request: Request, response: Response): Promise<void>;
    getComments(request: Request, response: Response): Promise<void>;
}
export declare const propertyController: PropertyController;
export {};
