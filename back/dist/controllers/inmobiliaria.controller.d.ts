import type { Request, Response } from "express";
declare class AgencyController {
    getPublic(request: Request, response: Response): Promise<void>;
    update(request: Request, response: Response): Promise<void>;
    delete(request: Request, response: Response): Promise<void>;
    getProperties(request: Request, response: Response): Promise<void>;
}
export declare const agencyController: AgencyController;
export {};
