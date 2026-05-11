declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
  }
}

declare module 'jsonwebtoken';
declare module 'bcryptjs';
declare module 'pdfkit';
declare module 'qrcode';
