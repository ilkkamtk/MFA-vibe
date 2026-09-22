import { NextFunction, Request, Response } from 'express';
import CustomError from '../../../classes/CustomError';
import { exampleData } from '../models/exampleModel';

export const getExample = (
  _request: Request,
  response: Response,
  next: NextFunction,
): void => {
  try {
    response.json(exampleData);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
