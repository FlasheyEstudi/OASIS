declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
  }
}

declare module 'next/server' {
  export { NextRequest, NextResponse } from 'next/dist/server/web/spec-extension/adapters/next-request';
}
