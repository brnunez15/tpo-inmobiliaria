import type { Request, Response } from "express";
declare class VisitRequestController {
    create(request: Request, response: Response): Promise<void>;
    patchStatus(request: Request, response: Response): Promise<void>;
    listByAgency(request: Request, response: Response): Promise<void>;
}
export declare const visitRequestController: VisitRequestController;
export {};
