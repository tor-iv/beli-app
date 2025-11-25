'use client';

/**
 * Search Performance Benchmark Dashboard
 *
 * Interactive demo page comparing Elasticsearch vs PostgreSQL (Supabase) search performance.
 * Designed to show founders the value of Elasticsearch for combined geo + text queries.
 *
 * URL: /dev/search-benchmark
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Zap, Database, Search, MapPin, Filter, Gauge, CheckCircle2, XCircle } from 'lucide-react';

type QueryType = 'autocomplete' | 'fulltext' | 'geo' | 'filtered';

interface BenchmarkResult {
  timing: number;
  resultCount: number;
  results: unknown[];
  error?: string;
}

interface BenchmarkResponse {
  query: string;
  queryType: QueryType;
  timestamp: string;
  elasticsearch: BenchmarkResult;
  supabase: BenchmarkResult;
  winner: 'elasticsearch' | 'supabase' | 'tie' | 'inconclusive';
  speedup: number;
  speedupText: string;
}

interface StressTestResponse {
  queryType: 'stress';
  timestamp: string;
  queriesRun: number;
  elasticsearch: {
    avgTime: number;
    p50: number;
    p95: number;
    p99: number;
    minTime: number;
    maxTime: number;
    failures: number;
  };
  supabase: {
    avgTime: number;
    p50: number;
    p95: number;
    p99: number;
    minTime: number;
    maxTime: number;
    failures: number;
  };
  winner: 'elasticsearch' | 'supabase';
  loadAdvantage: string;
}

interface HealthStatus {
  elasticsearch: { available: boolean; documentCount: number };
  supabase: { available: boolean };
}

// Preset queries for quick demos
const PRESET_QUERIES: Record<QueryType, { query: string; label: string; extra?: Record<string, string> }[]> = {
  autocomplete: [
    { query: 'pi', label: '2-char prefix' },
    { query: 'sushi', label: 'Full word' },
    { query: 'baltha', label: 'Long prefix' },
  ],
  fulltext: [
    { query: 'pizza brooklyn', label: 'Multi-word' },
    { query: 'itlaian', label: 'Typo (fuzzy)' },
    { query: 'romantic dinner', label: 'Semantic' },
  ],
  geo: [
    { query: 'pizza', label: 'Pizza near Times Sq', extra: { lat: '40.758', lon: '-73.9855' } },
    { query: 'sushi', label: 'Sushi near Empire State', extra: { lat: '40.7484', lon: '-73.9857' } },
    { query: '', label: 'Any food near Midtown', extra: { lat: '40.758', lon: '-73.98', distance: '5km' } },
  ],
  filtered: [
    { query: '', label: 'Italian cuisine', extra: { cuisine: 'Italian' } },
    { query: 'pasta', label: 'Pasta + Italian + 7+', extra: { cuisine: 'Italian', minRating: '7' } },
    { query: '', label: 'Japanese + high rated', extra: { cuisine: 'Japanese', minRating: '8' } },
  ],
};

// Speed comparison bar component
function SpeedComparisonBar({ esTime, pgTime, esError, pgError, esCount, pgCount }: {
  esTime: number;
  pgTime: number;
  esError?: string;
  pgError?: string;
  esCount: number;
  pgCount: number;
}) {
  const maxTime = Math.max(esTime, pgTime, 1);
  const esWidth = (esTime / maxTime) * 100;
  const pgWidth = (pgTime / maxTime) * 100;
  const esWinner = !esError && (pgError || esTime <= pgTime);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Elasticsearch
            <span className="text-gray-400 font-normal">
              ({esCount} results)
            </span>
          </span>
          <span className={esWinner ? 'text-teal-600 font-bold' : 'text-gray-500'}>
            {esError ? 'Error' : `${esTime.toFixed(1)}ms`} {esWinner && !esError && '(Winner)'}
          </span>
        </div>
        <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
          <div
            className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 ${
              esError ? 'bg-red-300' : esWinner ? 'bg-teal-500' : 'bg-gray-300'
            }`}
            style={{ width: esError ? '100%' : `${Math.max(esWidth, 5)}%` }}
          >
            {!esError && <span className="text-white font-medium text-sm">{esTime.toFixed(1)}ms</span>}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            PostgreSQL (Supabase)
            <span className="text-gray-400 font-normal">
              ({pgCount} results)
              {pgCount === 0 && !pgError && <span className="text-gray-400 text-xs ml-1">(no matches)</span>}
            </span>
          </span>
          <span className={!esWinner ? 'text-teal-600 font-bold' : 'text-gray-500'}>
            {pgError ? 'Error' : `${pgTime.toFixed(1)}ms`} {!esWinner && !pgError && '(Winner)'}
          </span>
        </div>
        <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
          <div
            className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 ${
              pgError ? 'bg-red-300' : !esWinner ? 'bg-teal-500' : 'bg-gray-300'
            }`}
            style={{ width: pgError ? '100%' : `${Math.max(pgWidth, 5)}%` }}
          >
            {!pgError && <span className="text-white font-medium text-sm">{pgTime.toFixed(1)}ms</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Speed badge showing the winner
function SpeedBadge({ speedup, winner, speedupText }: {
  speedup: number;
  winner: string;
  speedupText: string;
}) {
  // Handle inconclusive state
  if (winner === 'inconclusive') {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
        <div className="text-3xl font-bold text-amber-600 mb-2">
          Inconclusive
        </div>
        <div className="text-sm text-gray-700">{speedupText}</div>
      </div>
    );
  }

  const bgColor = winner === 'elasticsearch'
    ? 'from-teal-50 to-teal-100'
    : winner === 'supabase'
    ? 'from-blue-50 to-blue-100'
    : 'from-gray-50 to-gray-100';

  const textColor = winner === 'elasticsearch'
    ? 'text-teal-600'
    : winner === 'supabase'
    ? 'text-blue-600'
    : 'text-gray-600';

  return (
    <div className={`text-center p-6 bg-gradient-to-br ${bgColor} rounded-xl`}>
      <div className={`text-5xl font-bold ${textColor} mb-2`}>
        {speedup.toFixed(1)}x
      </div>
      <div className="text-lg text-gray-700">{speedupText}</div>
    </div>
  );
}

// Results preview showing top results from each backend
function ResultsPreview({ esResults, pgResults }: { esResults: unknown[]; pgResults: unknown[] }) {
  const formatResult = (r: unknown) => {
    const result = r as { name?: string; neighborhood?: string };
    return result?.name || 'Unknown';
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium text-sm text-gray-600 mb-2 flex items-center gap-1">
          <Zap className="h-3 w-3" /> ES Results ({esResults.length})
        </h4>
        <div className="space-y-1">
          {esResults.slice(0, 5).map((r, i) => (
            <div key={i} className="text-sm text-gray-800 truncate bg-gray-50 px-2 py-1 rounded">
              {formatResult(r)}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium text-sm text-gray-600 mb-2 flex items-center gap-1">
          <Database className="h-3 w-3" /> PG Results ({pgResults.length})
        </h4>
        <div className="space-y-1">
          {pgResults.slice(0, 5).map((r, i) => (
            <div key={i} className="text-sm text-gray-800 truncate bg-gray-50 px-2 py-1 rounded">
              {formatResult(r)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// History table showing recent benchmarks
function BenchmarkHistory({ history }: { history: BenchmarkResponse[] }) {
  if (history.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-800 mb-3">Recent Benchmarks</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Query</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-right py-2 px-2">ES</th>
              <th className="text-right py-2 px-2">PG</th>
              <th className="text-center py-2 px-2">Winner</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-2 truncate max-w-[150px]">{h.query || '(empty)'}</td>
                <td className="py-2 px-2 text-gray-600">{h.queryType}</td>
                <td className="py-2 px-2 text-right font-mono">{h.elasticsearch.timing.toFixed(1)}ms</td>
                <td className="py-2 px-2 text-right font-mono">{h.supabase.timing.toFixed(1)}ms</td>
                <td className="py-2 px-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    h.winner === 'elasticsearch' ? 'bg-teal-100 text-teal-700' :
                    h.winner === 'supabase' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {h.winner === 'elasticsearch' ? 'ES' : h.winner === 'supabase' ? 'PG' : 'Tie'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stress test results display
function StressTestResults({ results }: { results: StressTestResponse }) {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
        <div className="text-4xl font-bold text-purple-600 mb-2">
          {results.queriesRun} Concurrent Queries
        </div>
        <div className="text-lg text-gray-700">{results.loadAdvantage}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" /> Elasticsearch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Average</span>
              <span className="font-mono font-medium">{results.elasticsearch.avgTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P50 (Median)</span>
              <span className="font-mono">{results.elasticsearch.p50}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P95</span>
              <span className="font-mono">{results.elasticsearch.p95}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P99</span>
              <span className="font-mono">{results.elasticsearch.p99}ms</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Range</span>
              <span className="font-mono">{results.elasticsearch.minTime}-{results.elasticsearch.maxTime}ms</span>
            </div>
            {results.elasticsearch.failures > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Failures</span>
                <span className="font-mono">{results.elasticsearch.failures}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" /> PostgreSQL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Average</span>
              <span className="font-mono font-medium">{results.supabase.avgTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P50 (Median)</span>
              <span className="font-mono">{results.supabase.p50}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P95</span>
              <span className="font-mono">{results.supabase.p95}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P99</span>
              <span className="font-mono">{results.supabase.p99}ms</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Range</span>
              <span className="font-mono">{results.supabase.minTime}-{results.supabase.maxTime}ms</span>
            </div>
            {results.supabase.failures > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Failures</span>
                <span className="font-mono">{results.supabase.failures}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SearchBenchmarkPage() {
  const [query, setQuery] = useState('pizza');
  const [queryType, setQueryType] = useState<QueryType>('fulltext');
  const [loading, setLoading] = useState(false);
  const [stressLoading, setStressLoading] = useState(false);
  const [result, setResult] = useState<BenchmarkResponse | null>(null);
  const [stressResult, setStressResult] = useState<StressTestResponse | null>(null);
  const [history, setHistory] = useState<BenchmarkResponse[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/benchmark/search?health=true')
      .then((res) => res.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  const runBenchmark = useCallback(async (customQuery?: string, customType?: QueryType, extras?: Record<string, string>) => {
    setLoading(true);
    setResult(null);

    const q = customQuery ?? query;
    const t = customType ?? queryType;

    try {
      const params = new URLSearchParams({ q, type: t, ...extras });
      const res = await fetch(`/api/benchmark/search?${params}`);
      const data = await res.json() as BenchmarkResponse;
      setResult(data);
      setHistory((prev) => [data, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setLoading(false);
    }
  }, [query, queryType]);

  const runStressTest = async () => {
    setStressLoading(true);
    setStressResult(null);

    try {
      const res = await fetch('/api/benchmark/search?type=stress');
      const data = await res.json() as StressTestResponse;
      setStressResult(data);
    } catch (error) {
      console.error('Stress test failed:', error);
    } finally {
      setStressLoading(false);
    }
  };

  const queryTypeIcons: Record<QueryType, React.ReactNode> = {
    autocomplete: <Search className="h-4 w-4" />,
    fulltext: <Search className="h-4 w-4" />,
    geo: <MapPin className="h-4 w-4" />,
    filtered: <Filter className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Performance Benchmark</h1>
          <p className="text-gray-600">
            Compare Elasticsearch vs PostgreSQL (Supabase) search speed
          </p>
        </div>

        {/* Health Status */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            {health?.elasticsearch.available ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Elasticsearch</span>
            {health?.elasticsearch.documentCount && (
              <span className="text-gray-400">({health.elasticsearch.documentCount.toLocaleString()} docs)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {health?.supabase.available ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Supabase</span>
          </div>
        </div>

        {/* Query Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Run Benchmark</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search query..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && runBenchmark()}
              />
              <Select value={queryType} onValueChange={(v) => setQueryType(v as QueryType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="autocomplete">Autocomplete</SelectItem>
                  <SelectItem value="fulltext">Full-text</SelectItem>
                  <SelectItem value="geo">Geo + Text</SelectItem>
                  <SelectItem value="filtered">Filtered</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => runBenchmark()} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run'}
              </Button>
            </div>

            {/* Preset Buttons */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                {queryTypeIcons[queryType]}
                <span>Quick presets for {queryType}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUERIES[queryType].map((preset, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(preset.query);
                      runBenchmark(preset.query, queryType, preset.extra);
                    }}
                    disabled={loading}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Results: &quot;{result.query || '(empty)'}&quot;</span>
                <span className="text-sm font-normal text-gray-500">{result.queryType}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SpeedBadge
                speedup={result.speedup}
                winner={result.winner}
                speedupText={result.speedupText}
              />

              <SpeedComparisonBar
                esTime={result.elasticsearch.timing}
                pgTime={result.supabase.timing}
                esError={result.elasticsearch.error}
                pgError={result.supabase.error}
                esCount={result.elasticsearch.resultCount}
                pgCount={result.supabase.resultCount}
              />

              {/* Explain when ES finds results but PG doesn't */}
              {result.elasticsearch.resultCount > 0 && result.supabase.resultCount === 0 && !result.supabase.error && (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  ES fuzzy matching found results that PostgreSQL ILIKE missed. This demonstrates ES&apos;s typo tolerance and relevance scoring.
                </p>
              )}

              <ResultsPreview
                esResults={result.elasticsearch.results}
                pgResults={result.supabase.results}
              />
            </CardContent>
          </Card>
        )}

        {/* Stress Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Stress Test (Load Testing)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Fire 20 concurrent queries of mixed types to simulate real-world load.
              Shows average response time, P95, and P99 latencies.
            </p>
            <Button
              onClick={runStressTest}
              disabled={stressLoading}
              variant="outline"
              className="w-full"
            >
              {stressLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Running 20 concurrent queries...
                </>
              ) : (
                <>
                  <Gauge className="h-4 w-4 mr-2" />
                  Run Stress Test
                </>
              )}
            </Button>

            {stressResult && (
              <div className="mt-6">
                <StressTestResults results={stressResult} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardContent className="pt-6">
            <BenchmarkHistory history={history} />
            {history.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Run some benchmarks to see history here
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm">
          Benchmark dashboard for Beli search infrastructure
        </p>
      </div>
    </div>
  );
}
