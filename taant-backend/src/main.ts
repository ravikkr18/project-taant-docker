import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3007',
      'http://94.136.187.1:3000',
      'http://94.136.187.1:3001',
      'http://94.136.187.1:3002',
      'http://94.136.187.1:3007'
    ],
    credentials: true,
  });

  // Configure Express to handle larger request bodies (excluding multipart routes)
  const expressApp = app as NestExpressApplication;

  // Conditional body parser: only apply to non-multipart routes
  expressApp.use((req, res, next) => {
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('multipart/form-data')) {
      // Skip body parsing for multipart data - let FileInterceptor handle it
      next();
    } else {
      // Apply normal body parsing for other content types
      express.json({ limit: '50mb' })(req, res, (err) => {
        if (err) return next(err);
        express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 })(req, res, next);
      });
    }
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port} (accessible via external IP)`);
}
bootstrap();