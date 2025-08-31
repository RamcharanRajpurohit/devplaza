import { Request, Response, NextFunction } from "express";

type Controller = (req: Request, res: Response, next?: NextFunction) => Promise<any>;

export const tryCatch =
  (controller: Controller) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  };
