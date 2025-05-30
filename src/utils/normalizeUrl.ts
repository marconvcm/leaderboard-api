import { Request, Response, NextFunction } from "express";
import { app } from "../app";

// Normalize URL paths to collapse multiple slashes into one
export default function normalizeUrl(req: Request, res: Response, next: NextFunction) {
   req.url = req.url.replace(/\/+/g, '/');
   next();
}
