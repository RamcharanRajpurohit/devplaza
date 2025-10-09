
import { Response } from "express";

interface ResponseOptions {
  status?: number; 
  success?: boolean;
  message?: string;
  data?: any;//check about this can we use interface latter or not
  code?: string;
}

export const sendResponse = (res: Response, options: ResponseOptions) => {
  const { status = 200, success = true, message = "", data = {}, code } = options;
  const payload: any = { success, message, ...data };
  if (code) payload.code = code;
  return res.status(status).json(payload);
};
