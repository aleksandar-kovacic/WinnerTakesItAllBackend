import dotenv from 'dotenv';
dotenv.config();

import createError, {HttpError} from 'http-errors';
import express, {Request, Response, NextFunction} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';

// Redis
import { redisClient, redisStore } from './database/redis';
import session from "express-session"

//OpenAPI
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';
import * as OpenApiValidator from 'express-openapi-validator';

// Routes
import indexRouter from './routes/index';
import usersRouter from './routes/users/users';
import paymentsRouter from './routes/payments/payments';
import verificationRouter from './routes/verification/verification';


const app = express();

//Redis
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not defined');
}

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});

// Initialize session storage.
app.use(
  session({
    store: redisStore,
    resave: false, // Force lightweight session keep-alive
    saveUninitialized: false, // Only save sessions with data
    secret: sessionSecret,
    cookie: {
      secure: false, // Set to `true` if using HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

app.use(logger('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'))); //favicon.ico

// Swagger OpenAPI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAPI Validator
app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerSpec,
    validateRequests: true, // (default)
    validateResponses: true, // false by default
  }),
);

// Register routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/payments', paymentsRouter);
app.use('/verification', verificationRouter);

// OpenAPI Validator error handler
app.use((err:any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors
  });
});

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: HttpError, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json('error');
});

export default app;
