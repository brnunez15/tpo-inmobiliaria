import type { Request, Response } from "express";
declare class ActivityController {
    listByAgency(request: Request, response: Response): Promise<void>;
    markAsRead(request: Request, response: Response): Promise<void>;
    unreadCount(request: Request, response: Response): Promise<void>;
}
export declare const activityController: ActivityController;
export {};
