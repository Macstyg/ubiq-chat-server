import { Request, Response } from "express";
import path from "path";

export const index = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "views", "home.html"));
};
