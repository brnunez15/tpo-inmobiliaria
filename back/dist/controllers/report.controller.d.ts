import type { Request, Response } from "express";
declare class ReportController {
    private resolveAgency;
    private handleError;
    statusSummary(request: Request, response: Response): Promise<void>;
    monthly(request: Request, response: Response): Promise<void>;
    avgTimeOnMarket(request: Request, response: Response): Promise<void>;
}
export declare const reportController: ReportController;
export {};
