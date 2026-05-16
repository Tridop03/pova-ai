import { Request, Response, NextFunction } from 'express';
import response from '../utils/apiResponse';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    response.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

export default errorHandler;
