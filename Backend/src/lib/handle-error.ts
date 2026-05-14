import { NextResponse } from 'next/server';
import { AppError } from './errors';
import logger from './logger';

export function handleError(error: unknown, context?: string) {
  if (context) {
    logger.error({ context, error }, `Error in ${context}`);
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    logger.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
    }, 'Unhandled Error');

    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocurrió un error inesperado en el servidor',
      },
      { status: 500 }
    );
  }

  logger.error({ error }, 'Unknown Error type');

  return NextResponse.json(
    {
      success: false,
      code: 'UNKNOWN_ERROR',
      message: 'Ocurrió un error desconocido',
    },
    { status: 500 }
  );
}
