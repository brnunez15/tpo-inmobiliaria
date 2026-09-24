import type { Request, Response } from "express";
declare class CommentController {
    reply(request: Request, response: Response): Promise<void>;
}
export declare const commentController: CommentController;
export {};
