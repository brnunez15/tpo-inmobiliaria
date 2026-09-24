import type { Request, Response } from "express";
declare class AuthController {
    register(request: Request, response: Response): Promise<void>;
    login(request: Request, response: Response): Promise<void>;
}
export declare const authController: AuthController;
export {};
