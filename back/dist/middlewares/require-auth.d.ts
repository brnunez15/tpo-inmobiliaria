import type { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        interface Request {
            sellerId?: number;
        }
    }
}
export declare function requireAuth(request: Request, response: Response, next: NextFunction): void;
