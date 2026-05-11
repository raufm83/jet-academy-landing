import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

const ALLOWED_ORIGINS = [
  'https://new.jetacademy.az',
  'https://jetacademy.az',
  'https://www.jetacademy.az',
  'https://www.new.jetacademy.az',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3032',
  'http://localhost:3030',
  'http://localhost:3031',
];

const EXTRA_ORIGINS = (process.env.CORS_EXTRA_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const DEFAULT_ORIGIN = 'https://jetacademy.az';

function isLikelyLocalHostname(hostname: string): boolean {
  return /^[a-z0-9-]+$/i.test(hostname) && !hostname.includes('.');
}

function isPrivateIpv4Host(hostname: string): boolean {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    hostname === '127.0.0.1'
  );
}

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (EXTRA_ORIGINS.includes(origin)) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    if (!['http:', 'https:'].includes(protocol)) return false;

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    ) {
      return true;
    }

    if (
      hostname === 'jetacademy.az' ||
      hostname.endsWith('.jetacademy.az')
    ) {
      return true;
    }

    if (isPrivateIpv4Host(hostname)) {
      return true;
    }

    if (
      isLikelyLocalHostname(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.lan')
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function setCorsHeaders(res: Response, req: Request): void {
  const origin = req.headers.origin as string | undefined;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', DEFAULT_ORIGIN);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization, Origin, X-Requested-With',
  );
  res.setHeader('Access-Control-Max-Age', '86400');
}

@Catch()
export class CorsExceptionFilter extends BaseExceptionFilter {
  constructor(protected readonly httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    setCorsHeaders(response, request);

    super.catch(exception, host);
  }
}

export { setCorsHeaders, ALLOWED_ORIGINS, DEFAULT_ORIGIN, isAllowedOrigin };
