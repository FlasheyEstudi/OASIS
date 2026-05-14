import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Logger ultra-seguro para evitar "Error: the worker has exited"
const logger = isProduction 
  ? pino({ level: 'info' }) 
  : {
      info: (obj: any, msg?: string) => console.log(`[INFO] ${msg || ''}`, JSON.stringify(obj)),
      error: (obj: any, msg?: string) => console.error(`[ERROR] ${msg || ''}`, JSON.stringify(obj)),
      warn: (obj: any, msg?: string) => console.warn(`[WARN] ${msg || ''}`, JSON.stringify(obj)),
      debug: (obj: any, msg?: string) => console.debug(`[DEBUG] ${msg || ''}`, JSON.stringify(obj)),
      fatal: (obj: any, msg?: string) => console.error(`[FATAL] ${msg || ''}`, JSON.stringify(obj)),
    };

export default logger;
