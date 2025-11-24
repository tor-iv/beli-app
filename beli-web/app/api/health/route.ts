/**
 * Health Check API Route
 *
 * Returns the status of backend services (Elasticsearch, Supabase).
 *
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { healthCheck as esHealthCheck } from '@/lib/elasticsearch/client';

export async function GET() {
  const services: {
    elasticsearch: { status: string; documents?: number };
    supabase: { status: string };
  } = {
    elasticsearch: { status: 'unknown' },
    supabase: { status: 'unknown' },
  };

  // Check Elasticsearch
  try {
    const esHealth = await esHealthCheck();
    services.elasticsearch = {
      status: esHealth.available ? 'healthy' : 'unavailable',
      documents: esHealth.documentCount,
    };
  } catch {
    services.elasticsearch = { status: 'error' };
  }

  // Check Supabase (simple connectivity check)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      services.supabase = {
        status: response.ok || response.status === 401 ? 'healthy' : 'unavailable',
      };
    } else {
      services.supabase = { status: 'not_configured' };
    }
  } catch {
    services.supabase = { status: 'error' };
  }

  const allHealthy = Object.values(services).every(
    (s) => s.status === 'healthy' || s.status === 'not_configured'
  );

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      services,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
