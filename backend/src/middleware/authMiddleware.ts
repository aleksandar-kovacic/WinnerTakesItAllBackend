import { Request, Response, NextFunction } from 'express';

// Middleware to check if the user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.userKey) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}
