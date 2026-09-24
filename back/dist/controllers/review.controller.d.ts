import type { Request, Response } from "express";
declare class ReviewController {
    create(request: Request, response: Response): Promise<void>;
    list(request: Request, response: Response): Promise<void>;
}
export declare const reviewController: ReviewController;
export {};
