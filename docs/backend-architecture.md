# Beli Backend Architecture

## Overview

This document outlines the comprehensive backend architecture for the Beli application, designed to replace the current MockDataService implementation with a scalable, production-ready system.

## Executive Summary

**Current State**: Both mobile and web apps use MockDataService with in-memory data storage
**Target State**: Production backend with PostgreSQL, Redis caching, S3 storage, and RESTful/GraphQL APIs
**Migration Strategy**: Incremental replacement with backward-compatible API clients

---

## Technology Stack

### Primary Backend Framework

**Recommendation: Node.js + NestJS**

**Rationale:**
- **TypeScript consistency**: Share types between frontend and backend
- **Code reusability**: Leverage existing type definitions from beli-native/src/types.ts
- **Developer experience**: Team already familiar with TypeScript/React ecosystem
- **Mature ecosystem**: Rich library support for all required features
- **Performance**: Node.js handles concurrent I/O operations efficiently

**Alternative Options:**
- **Go + Gin/Echo**: Better performance for CPU-intensive operations (matching algorithm)
- **Python + FastAPI**: Excellent for ML/recommendation features (future expansion)

### Database Layer

#### Primary Database: PostgreSQL 15+

**Why PostgreSQL:**
- **Relational data model**: Perfect for users, restaurants, relationships, reviews
- **JSON support**: Store flexible data (menu items, tags, metadata) as JSONB
- **Full-text search**: Built-in search capabilities for restaurants/users
- **Geographic queries**: PostGIS extension for location-based features
- **ACID compliance**: Critical for transactions (reviews, list updates)
- **Mature**: Battle-tested at scale

**Schema Highlights:**
- 15+ core tables (see database-schema.md)
- Composite indexes for common queries
- Foreign key constraints for data integrity
- Partial indexes for soft-deletes and filtering

#### Cache Layer: Redis 7+

**Use Cases:**
- **Session storage**: JWT token blacklist, active sessions
- **Match percentage cache**: 5-minute TTL for user similarity scores
- **Feed cache**: Pre-computed activity feeds per user
- **Rate limiting**: Token bucket algorithm
- **Real-time data**: Online user presence, notification counts
- **Leaderboard**: Sorted sets for efficient ranking queries

#### Search Engine: Elasticsearch 8+ (Optional Phase 2)

**Use Cases:**
- **Restaurant search**: Full-text search with filters (cuisine, price, location)
- **User search**: Fuzzy matching on names and usernames
- **Tastemaker content**: Article search with relevance scoring
- **Autocomplete**: Type-ahead suggestions
- **Analytics**: Aggregations for trending restaurants

### File Storage

**Recommendation: AWS S3 or Cloudinary**

**S3 Use Cases:**
- User profile photos
- Restaurant images
- Review photos
- Tastemaker article images
- List thumbnails

**Configuration:**
- **Bucket structure**: `beli-prod/users/`, `beli-prod/restaurants/`, etc.
- **CDN**: CloudFront for global distribution
- **Image processing**: Lambda@Edge or imgix for resizing/optimization
- **Upload strategy**: Pre-signed URLs for direct client upload
- **Lifecycle**: Archive old images to Glacier after 2 years

---

## Architecture Patterns

### API Design: Hybrid REST + GraphQL

#### REST API (Primary)

**Why REST:**
- Simple, well-understood
- Perfect for mobile apps with predictable queries
- Easy caching with HTTP headers
- Great tooling (Swagger/OpenAPI)

**Structure:**
```
/api/v1/auth/*          - Authentication
/api/v1/users/*         - User management
/api/v1/restaurants/*   - Restaurant operations
/api/v1/lists/*         - User lists
/api/v1/feed/*          - Social feed
/api/v1/tastemakers/*   - Tastemaker content
/api/v1/groups/*        - Group dinner features
```

#### GraphQL API (Supplementary)

**Why GraphQL:**
- **Complex queries**: Fetch user + restaurants + reviews in single request
- **Web optimization**: Reduce over-fetching
- **Developer experience**: Type-safe queries with code generation

**Use Cases:**
- Profile pages (user + stats + restaurants + followers in one query)
- Feed items with nested data
- Tastemaker posts with related restaurants/lists

**Implementation**: Apollo Server alongside REST routes

### Authentication & Authorization

#### Authentication Strategy

**JWT (JSON Web Tokens)**

**Flow:**
1. User signs up/logs in → Server validates credentials
2. Server generates JWT with payload: `{ userId, email, role, iat, exp }`
3. Token stored in mobile secure storage / web httpOnly cookie
4. Client sends token in `Authorization: Bearer <token>` header
5. Server validates token on protected routes

**Token Expiration:**
- **Access token**: 15 minutes
- **Refresh token**: 30 days (stored in Redis with user session)

**OAuth2 Integration:**
- Google Sign-In
- Apple Sign-In (required for iOS)
- Email/password fallback

#### Authorization Strategy

**Role-Based Access Control (RBAC)**

**Roles:**
- `user` - Standard app user
- `tastemaker` - Verified food expert
- `admin` - Platform administrator
- `moderator` - Content moderator

**Permission Examples:**
- Create review: `user`, `tastemaker`, `admin`
- Publish tastemaker post: `tastemaker`, `admin`
- Delete any content: `admin`, `moderator`
- View private lists: owner only

**Implementation**: Middleware decorator pattern
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tastemaker', 'admin')
async createPost() { ... }
```

### Real-Time Features

**WebSocket Layer: Socket.io**

**Real-Time Events:**
- **Notifications**: New follow, review like, comment
- **Activity feed**: Live updates when friends add restaurants
- **Group dinner**: Real-time participant status during swipe session
- **Messaging** (future): Direct messages between users

**Connection Management:**
- Authenticate WebSocket with JWT
- Join user-specific rooms for targeted broadcasts
- Heartbeat/reconnection logic
- Redis adapter for horizontal scaling

### Caching Strategy

**Multi-Layer Caching**

1. **Application Cache (in-memory)**
   - Hot data: Current user profile
   - Duration: Request lifecycle only

2. **Redis Cache**
   - Match percentages (5 min TTL)
   - Activity feed (2 min TTL)
   - Restaurant details (10 min TTL)
   - User stats (5 min TTL)

3. **CDN Cache (CloudFront)**
   - Static images
   - Restaurant photos
   - Public API responses (with Cache-Control headers)

**Cache Invalidation:**
- Write-through: Update cache on writes
- Event-driven: Invalidate on specific actions (e.g., new review → clear restaurant cache)
- Time-based: Automatic TTL expiration

### Background Jobs

**Queue System: BullMQ (Redis-based)**

**Job Types:**
1. **Email notifications**: Welcome email, weekly digest
2. **Feed generation**: Pre-compute activity feeds for active users
3. **Leaderboard updates**: Recalculate rankings nightly
4. **Image processing**: Resize/optimize uploaded photos
5. **Analytics**: Daily/weekly stats aggregation
6. **Match percentage**: Pre-calculate for common pairs
7. **Recommendation updates**: Refresh "What to Order" cache

**Worker Configuration:**
- Separate workers per job type
- Retry logic with exponential backoff
- Dead letter queue for failed jobs
- Job monitoring with Bull Board UI

---

## Deployment Architecture

### Option 1: Monolith (Recommended for MVP)

**Structure:**
```
┌─────────────────────────────────────┐
│   Load Balancer (ALB/nginx)        │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│  App   │      │   App   │  (Horizontal scaling)
│ Server │      │  Server │
└───┬────┘      └────┬────┘
    │                │
    └────────┬───────┘
             │
    ┌────────▼─────────┐
    │   PostgreSQL     │  (Primary + Read Replicas)
    └──────────────────┘
    ┌──────────────────┐
    │      Redis       │  (Cache + Queue)
    └──────────────────┘
    ┌──────────────────┐
    │       S3         │  (File Storage)
    └──────────────────┘
```

**Benefits:**
- Simple deployment and debugging
- Lower operational complexity
- Shared database transactions
- Faster development velocity

**Hosting Options:**
- **Railway**: $5-20/month, simple deployment, PostgreSQL + Redis included
- **Render**: Free tier available, easy PostgreSQL setup
- **AWS ECS/Fargate**: Production-grade, auto-scaling
- **DigitalOcean App Platform**: $12/month, managed database

### Option 2: Microservices (Future Scaling)

**Service Breakdown:**
```
┌─────────────────────────────────────┐
│         API Gateway                 │
│     (Kong/Traefik/AWS ALB)         │
└─────────────────────────────────────┘
         │
         ├──► User Service (Auth, Profile, Social)
         ├──► Restaurant Service (CRUD, Search)
         ├──► Review Service (Ratings, Comments)
         ├──► Feed Service (Activity, Timeline)
         ├──► List Service (User Lists, Featured)
         ├──► Tastemaker Service (Posts, Badges)
         ├──► Match Service (Group Dinner, Recommendations)
         └──► Notification Service (Push, Email)
```

**When to Split:**
- 100k+ active users
- Team size > 10 engineers
- Need independent scaling (e.g., Feed service during peak hours)
- Clear domain boundaries established

---

## API Architecture

### RESTful Principles

**Resource-Oriented Design:**
```
GET    /api/v1/restaurants           - List restaurants
GET    /api/v1/restaurants/:id       - Get restaurant details
POST   /api/v1/restaurants           - Create restaurant (admin only)
PATCH  /api/v1/restaurants/:id       - Update restaurant
DELETE /api/v1/restaurants/:id       - Delete restaurant (soft)

POST   /api/v1/restaurants/:id/reviews  - Add review
GET    /api/v1/restaurants/:id/reviews  - Get reviews
```

**Nested Resources:**
```
GET /api/v1/users/:id/lists                    - User's lists
GET /api/v1/users/:id/lists/been              - Been list
POST /api/v1/users/:id/lists/been/restaurants - Add to been list
```

### Request/Response Standards

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Request-ID: <uuid>  (for tracing)
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 250,
    "hasMore": true
  },
  "requestId": "uuid"
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "RESTAURANT_NOT_FOUND",
    "message": "Restaurant with ID 123 not found",
    "details": { ... },
    "requestId": "uuid"
  }
}
```

### Pagination

**Cursor-Based (Recommended for feeds):**
```
GET /api/v1/feed?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
```

**Offset-Based (For countable lists):**
```
GET /api/v1/restaurants?page=2&pageSize=20

Response:
{
  "data": [...],
  "meta": {
    "page": 2,
    "pageSize": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

### Rate Limiting

**Strategy: Token Bucket Algorithm**

**Tiers:**
- **Unauthenticated**: 10 requests/minute
- **Authenticated users**: 100 requests/minute
- **Tastemakers**: 200 requests/minute
- **Admin**: Unlimited

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640000000
```

**429 Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 45 seconds.",
    "retryAfter": 45
  }
}
```

---

## Data Flow Examples

### Example 1: User Views Restaurant Details

```
1. Mobile app → GET /api/v1/restaurants/123
2. API Gateway → JWT validation (cached public key)
3. Restaurant Controller → Check Redis cache
   - Cache HIT → Return cached data (skip DB)
   - Cache MISS → Continue
4. Restaurant Service → PostgreSQL query
   - JOIN reviews, menu_items, user_relations
5. Calculate isOpen, closingTime (business logic)
6. Store in Redis (TTL: 10 min)
7. Return JSON response → Mobile app
```

**Response Time Target**: < 100ms (cached), < 300ms (uncached)

### Example 2: User Adds Restaurant to "Been" List

```
1. Mobile app → POST /api/v1/users/me/lists/been/restaurants
   Body: { restaurantId: 123, rating: 8.5, visitDate: "2025-01-15" }
2. API Gateway → JWT validation → Extract userId
3. List Controller → Validate restaurant exists
4. Transaction BEGIN
   a. INSERT into user_restaurant_relations
   b. UPDATE user stats (beenCount++)
   c. INSERT activity_feed (new visit)
   d. Check for streak update
5. Transaction COMMIT
6. Cache invalidation:
   - Clear user stats cache
   - Clear user lists cache
   - Clear feed cache for followers
7. WebSocket broadcast → Notify followers
8. Background job → Send notifications
9. Return 201 Created → Mobile app
```

**Response Time Target**: < 500ms

### Example 3: Group Dinner Matching

```
1. Mobile app → POST /api/v1/groups/matches
   Body: { participantIds: [1, 2, 3, 4], date: "2025-02-01" }
2. API Gateway → JWT validation
3. Group Service → Fetch all participants' want-to-try lists
4. Calculate intersection (Set operations)
5. For each candidate restaurant:
   a. Calculate want-to-try overlap score (70%)
   b. Check dietary compatibility (20%)
   c. Calculate location convenience (10%)
   d. Generate match reasons
6. Sort by score, filter top 20
7. Return matches → Mobile app
```

**Response Time Target**: < 2 seconds (complex calculation)

**Optimization**: Pre-calculate common friend group combinations

---

## Security Considerations

### Data Protection

**Encryption:**
- **In transit**: TLS 1.3 for all API traffic
- **At rest**: Encrypted PostgreSQL storage (AWS RDS encryption)
- **Sensitive fields**: Bcrypt for passwords (12 rounds)

**PII Handling:**
- Email, phone, location stored encrypted
- Soft-delete user accounts (GDPR compliance)
- Data export API for user rights

### API Security

**Rate Limiting**: Prevent abuse and DDoS
**Input Validation**: Joi/Zod schemas for all requests
**SQL Injection**: Parameterized queries (Prisma/TypeORM)
**XSS Protection**: Sanitize HTML in reviews/comments
**CORS**: Whitelist only mobile app and web domains

### Authentication Security

**JWT Best Practices:**
- Short expiration (15 min)
- Refresh token rotation
- Token blacklist in Redis
- Logout invalidates all user tokens

**OAuth2:**
- State parameter validation (CSRF protection)
- PKCE for mobile flows
- Scope-based permissions

---

## Monitoring & Observability

### Application Metrics

**Key Metrics:**
- Request rate (requests/second)
- Error rate (4xx, 5xx)
- Response time (p50, p95, p99)
- Database query time
- Cache hit ratio

**Tools:**
- **Prometheus**: Metric collection
- **Grafana**: Dashboards
- **Datadog/New Relic**: All-in-one APM (paid)

### Logging

**Structured Logging (JSON):**
```json
{
  "timestamp": "2025-01-29T12:00:00Z",
  "level": "info",
  "service": "api",
  "requestId": "uuid",
  "userId": 123,
  "endpoint": "/api/v1/restaurants",
  "method": "GET",
  "duration": 45,
  "statusCode": 200
}
```

**Log Levels:**
- `error`: Critical issues requiring immediate attention
- `warn`: Potential issues (rate limit approaching)
- `info`: Standard operations (requests, jobs completed)
- `debug`: Detailed diagnostic information

**Aggregation**: CloudWatch Logs, Elasticsearch, or Logtail

### Error Tracking

**Sentry Integration:**
- Automatic exception capture
- Source maps for stack traces
- User context (userId, email)
- Breadcrumbs (recent actions)
- Release tracking

### Health Checks

**Endpoints:**
```
GET /health         → 200 OK (simple ping)
GET /health/ready   → Database + Redis connectivity
GET /health/live    → App is running (for k8s liveness probe)
```

---

## Performance Targets

### API Response Times

| Endpoint Type | Target (p95) | Target (p99) |
|---------------|--------------|--------------|
| Simple GET (cached) | 50ms | 100ms |
| Simple GET (uncached) | 200ms | 400ms |
| Complex GET (with joins) | 500ms | 1s |
| POST/PATCH | 300ms | 600ms |
| Search queries | 400ms | 800ms |
| Matching algorithm | 2s | 4s |

### Database Performance

- **Connection pool**: 10-50 connections
- **Query timeout**: 10 seconds
- **Index all foreign keys**: Automatic join optimization
- **Read replicas**: Route read-heavy queries (feed, search)

### Caching Performance

- **Cache hit ratio**: > 80% for hot data
- **Redis latency**: < 5ms (same AZ)

---

## Scalability Plan

### Vertical Scaling (Phase 1)

**Current MVP needs**: 2 vCPU, 4GB RAM
**1k users**: 4 vCPU, 8GB RAM
**10k users**: 8 vCPU, 16GB RAM

### Horizontal Scaling (Phase 2)

**Load balancer** → Multiple app servers
**Database**: Primary + 2 read replicas
**Redis**: Cluster mode (3 masters, 3 replicas)

### Geographic Distribution (Phase 3)

**Multi-region deployment:**
- US-East (primary)
- US-West (secondary)
- EU-West (future)

**Data replication**: PostgreSQL logical replication
**CDN**: CloudFront edge locations worldwide

---

## Cost Estimates

### Startup (< 1k users)

- **Hosting**: Railway/Render - $20/month
- **Database**: PostgreSQL managed - $15/month
- **Redis**: 256MB - $5/month
- **Storage**: S3 - $5/month
- **Total**: ~$45/month

### Growth (10k users)

- **Hosting**: AWS ECS - $150/month
- **Database**: RDS db.t3.large - $100/month
- **Redis**: ElastiCache - $50/month
- **Storage**: S3 + CloudFront - $50/month
- **Monitoring**: Datadog - $100/month
- **Total**: ~$450/month

### Scale (100k users)

- **Hosting**: Auto-scaling ECS - $800/month
- **Database**: RDS db.r5.xlarge + replicas - $600/month
- **Redis**: ElastiCache cluster - $200/month
- **Storage**: S3 + CloudFront - $300/month
- **Monitoring/Logging**: $300/month
- **Total**: ~$2,200/month

---

## Migration Strategy

See [backend-integration-guide.md](./backend-integration-guide.md) for detailed migration path from MockDataService to production backend.

**Phased Approach:**
1. **Phase 1**: Set up infrastructure, deploy skeleton API
2. **Phase 2**: Migrate authentication and user management
3. **Phase 3**: Migrate restaurant and list features
4. **Phase 4**: Migrate social features (feed, following)
5. **Phase 5**: Migrate complex features (matching, recommendations)
6. **Phase 6**: Real-time features and polish

**Timeline**: 8-12 weeks for full migration

---

## Technology Alternatives Comparison

### Backend Framework

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **NestJS (Node.js)** | TypeScript, familiar, large ecosystem | Slower than Go/Rust | **Recommended** |
| **Go (Gin/Echo)** | Fast, efficient, great concurrency | Different language, steeper learning curve | Alternative |
| **Python (FastAPI)** | Easy ML integration, rapid prototyping | Slower, async complexity | Future consideration |

### Database

| Database | Pros | Cons | Verdict |
|----------|------|------|---------|
| **PostgreSQL** | Relational, ACID, mature, JSON support | Complex queries can be slow | **Recommended** |
| **MongoDB** | Flexible schema, fast writes | No transactions (older versions), complex joins | Not suitable |
| **MySQL** | Popular, widely supported | Less feature-rich than Postgres | Viable alternative |

### Hosting

| Platform | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Railway** | Simple, affordable, includes DB | Limited scale | **Best for MVP** |
| **AWS ECS** | Scalable, mature, full AWS integration | Complex setup, costly | Best for scale |
| **Vercel** | Great for Next.js, serverless | Not ideal for complex backend | Not recommended |

---

## Next Steps

1. Review this architecture document with the team
2. Read [backend-api-spec.md](./backend-api-spec.md) for detailed API endpoints
3. Review [backend-database-schema.md](./backend-database-schema.md) for database design
4. Study [backend-business-logic.md](./backend-business-logic.md) for algorithm implementations
5. Follow [backend-integration-guide.md](./backend-integration-guide.md) for migration plan
6. Set up development environment and create first endpoint
7. Deploy MVP backend to Railway/Render
8. Incrementally migrate features from MockDataService

---

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [REST API Design Best Practices](https://restfulapi.net/)
- [The Twelve-Factor App](https://12factor.net/)
