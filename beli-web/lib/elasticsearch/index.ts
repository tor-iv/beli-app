/**
 * Elasticsearch exports
 */

export {
  searchRestaurants,
  autocomplete,
  geoSearch,
  healthCheck,
} from './client';

export type {
  SearchResult,
  SearchOptions,
  SearchResponse,
} from './client';
