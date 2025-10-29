# Beli Backend Integration Guide

## Overview

This guide provides a step-by-step plan to migrate from MockDataService to a production backend. The migration is designed to be incremental, allowing you to replace services module by module while maintaining app functionality.

---

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Phase 0: Preparation](#phase-0-preparation)
3. [Phase 1: Authentication](#phase-1-authentication)
4. [Phase 2: Users & Profile](#phase-2-users--profile)
5. [Phase 3: Restaurants & Lists](#phase-3-restaurants--lists)
6. [Phase 4: Social Features](#phase-4-social-features)
7. [Phase 5: Complex Features](#phase-5-complex-features)
8. [Phase 6: Real-time & Polish](#phase-6-real-time--polish)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)

---

## Migration Strategy

### Principles

1. **Incremental**: Replace one service at a time
2. **Backward compatible**: Keep MockDataService as fallback during migration
3. **Feature flagged**: Use flags to toggle between mock and real API
4. **Tested**: Each phase thoroughly tested before proceeding
5. **Reversible**: Easy rollback if issues arise

### Timeline

**Total estimated time**: 8-12 weeks (for experienced team)

- Phase 0: 1 week (setup)
- Phase 1: 1-2 weeks (auth)
- Phase 2: 1 week (users)
- Phase 3: 2 weeks (restaurants/lists)
- Phase 4: 2 weeks (social)
- Phase 5: 2-3 weeks (complex features)
- Phase 6: 1 week (polish)

---

## Phase 0: Preparation

### Week 1: Setup Backend Infrastructure

#### 1.1 Initialize Backend Project

**Option A: NestJS (Recommended)**

```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Create new project
nest new beli-backend
cd beli-backend

# Install dependencies
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install @prisma/client
npm install class-validator class-transformer
npm install @nestjs/config
npm install bcrypt
npm install redis ioredis
npm install @nestjs/throttler
```

**Option B: Express.js**

```bash
mkdir beli-backend
cd beli-backend
npm init -y

# Install dependencies
npm install express typescript ts-node
npm install prisma @prisma/client
npm install jsonwebtoken bcrypt
npm install express-validator
npm install redis
npm install helmet cors
```

#### 1.2 Set Up Database

**PostgreSQL Setup**

```bash
# Local (via Docker)
docker run --name beli-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Or use hosted service (Railway, Render, AWS RDS)
```

**Prisma Setup**

```bash
npx prisma init

# Edit prisma/schema.prisma with your database URL
# Copy schema from backend-database-schema.md

npx prisma migrate dev --name init
npx prisma generate
```

#### 1.3 Set Up Redis

```bash
# Local (via Docker)
docker run --name beli-redis -p 6379:6379 -d redis:7

# Or use hosted service (Redis Cloud, AWS ElastiCache)
```

#### 1.4 Deploy Backend (Staging)

**Railway (Easiest)**

```bash
# Install Railway CLI
npm install -g railway

# Login and deploy
railway login
railway init
railway up

# Add PostgreSQL and Redis addons via Railway dashboard
```

**Alternative: Render, AWS ECS, DigitalOcean**

#### 1.5 Copy Type Definitions

Create shared types package:

```bash
# In monorepo root
mkdir packages
cd packages
mkdir beli-types
cd beli-types
npm init -y

# Copy types from beli-native/src/types.ts
cp ../../beli-native/src/types.ts ./index.ts

# Export types
# Edit index.ts to export all types
```

Update `tsconfig.json` in both mobile and backend:

```json
{
  "compilerOptions": {
    "paths": {
      "@beli/types": ["./packages/beli-types"]
    }
  }
}
```

---

## Phase 1: Authentication

### Week 2-3: Implement Auth System

#### 1.1 Backend: Create Auth Module

**File**: `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**File**: `src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, username: string, displayName: string) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.usersService.create({
      email,
      passwordHash,
      username,
      displayName,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private generateAccessToken(userId: number, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    });
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '30d' }
    );

    // Store in database
    await this.usersService.createRefreshToken(userId, token);

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    const payload = this.jwtService.verify(refreshToken);

    // Check if token exists in DB and not revoked
    const isValid = await this.usersService.isRefreshTokenValid(refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new access token
    const user = await this.usersService.findById(payload.sub);
    const accessToken = this.generateAccessToken(user.id, user.email);

    return {
      accessToken,
      expiresIn: 900,
    };
  }

  async logout(userId: number, refreshToken: string) {
    // Revoke refresh token
    await this.usersService.revokeRefreshToken(refreshToken);

    // Add access token to blacklist (Redis)
    // Implementation depends on your setup
  }
}
```

#### 1.2 Mobile: Create API Client

**File**: `beli-native/src/services/apiClient.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.beli.app/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.accessToken) {
          this.accessToken = await AsyncStorage.getItem('accessToken');
        }

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const newAccessToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
            // Navigate to login screen (implement via navigation ref)
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async signup(email: string, password: string, username: string, displayName: string) {
    const response = await this.client.post('/auth/signup', {
      email,
      password,
      username,
      displayName,
    });

    await this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    return response.data.data.user;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });

    await this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    return response.data.data.user;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      this.refreshToken = await AsyncStorage.getItem('refreshToken');
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken: this.refreshToken,
    });

    const newAccessToken = response.data.data.accessToken;
    await this.setTokens(newAccessToken, this.refreshToken!);

    return newAccessToken;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout', {
        refreshToken: this.refreshToken,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    await this.clearTokens();
  }

  private async setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  private async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data.data;
  }
}

export default new ApiClient();
```

#### 1.3 Feature Flag System

**File**: `beli-native/src/config/featureFlags.ts`

```typescript
export const FEATURE_FLAGS = {
  USE_REAL_API: __DEV__ ? false : true, // Toggle per feature
  AUTH_ENABLED: true,
  RESTAURANTS_ENABLED: false,
  SOCIAL_ENABLED: false,
};
```

#### 1.4 Update Auth Screens

Replace mock auth with real API calls:

**File**: `beli-native/src/screens/LoginScreen.tsx`

```typescript
import apiClient from '../services/apiClient';
import { FEATURE_FLAGS } from '../config/featureFlags';

// In handleLogin function:
if (FEATURE_FLAGS.AUTH_ENABLED) {
  const user = await apiClient.login(email, password);
  // Store user in context/state
} else {
  // Use MockDataService
  const user = await MockDataService.login(email, password);
}
```

#### 1.5 Testing

**Checklist**:
- [ ] Signup creates user in database
- [ ] Login returns valid JWT tokens
- [ ] Access token expires after 15 minutes
- [ ] Refresh token renews access token
- [ ] Logout revokes tokens
- [ ] Invalid credentials return 401
- [ ] Token stored in AsyncStorage
- [ ] App remembers user on restart

---

## Phase 2: Users & Profile

### Week 4: User Management

#### 2.1 Backend: Implement User Endpoints

See [backend-api-spec.md](./backend-api-spec.md) Section 2 for full API spec.

**Key endpoints**:
- `GET /users/me`
- `GET /users/:id`
- `PATCH /users/me`
- `POST /users/me/avatar`
- `GET /users/:id/stats`

#### 2.2 Mobile: Create User Service

**File**: `beli-native/src/services/userService.ts`

```typescript
import apiClient from './apiClient';
import { MockDataService } from '../data/mockDataService';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { User } from '../types';

class UserService {
  async getCurrentUser(): Promise<User> {
    if (FEATURE_FLAGS.USE_REAL_API) {
      return await apiClient.get<User>('/users/me');
    } else {
      return await MockDataService.getCurrentUser();
    }
  }

  async getUserById(userId: number): Promise<User> {
    if (FEATURE_FLAGS.USE_REAL_API) {
      return await apiClient.get<User>(`/users/${userId}`);
    } else {
      return await MockDataService.getUserById(userId);
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (FEATURE_FLAGS.USE_REAL_API) {
      return await apiClient.patch<User>('/users/me', updates);
    } else {
      // Mock update
      const currentUser = await MockDataService.getCurrentUser();
      return { ...currentUser, ...updates };
    }
  }

  async uploadAvatar(imageUri: string): Promise<string> {
    if (FEATURE_FLAGS.USE_REAL_API) {
      // 1. Get presigned URL
      const { uploadUrl, imageId } = await apiClient.post('/upload/presigned-url', {
        fileType: 'image/jpeg',
        category: 'avatar',
      });

      // 2. Upload to S3
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' },
      });

      // 3. Confirm upload
      return await apiClient.post('/users/me/avatar', { imageId });
    } else {
      return imageUri; // Mock: return same URI
    }
  }
}

export default new UserService();
```

#### 2.3 Update Profile Screen

Replace MockDataService calls with UserService:

```typescript
import userService from '../services/userService';

const user = await userService.getCurrentUser();
await userService.updateProfile({ displayName: newName });
```

---

## Phase 3: Restaurants & Lists

### Week 5-6: Restaurant Data & Lists

#### 3.1 Seed Production Database

**Script**: `scripts/seedRestaurants.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { restaurantsData } from './data/restaurants'; // Import from mock data

const prisma = new PrismaClient();

async function seedRestaurants() {
  console.log('Seeding restaurants...');

  for (const restaurant of restaurantsData) {
    await prisma.restaurant.create({
      data: {
        name: restaurant.name,
        cuisines: restaurant.cuisines,
        priceRange: restaurant.priceRange,
        // ... map all fields
      },
    });
  }

  console.log('✅ Restaurants seeded');
}

seedRestaurants();
```

Run: `npx ts-node scripts/seedRestaurants.ts`

#### 3.2 Backend: Implement Restaurant Endpoints

See [backend-api-spec.md](./backend-api-spec.md) Section 3 for full spec.

**Key endpoints**:
- `GET /restaurants`
- `GET /restaurants/:id`
- `GET /restaurants/:id/menu`
- `POST /users/me/lists/:scope/restaurants`
- `DELETE /users/me/lists/:scope/restaurants/:id`

#### 3.3 Mobile: Create Restaurant Service

**File**: `beli-native/src/services/restaurantService.ts`

```typescript
class RestaurantService {
  async getRestaurants(filters?: RestaurantFilters): Promise<Restaurant[]> {
    if (FEATURE_FLAGS.USE_REAL_API && FEATURE_FLAGS.RESTAURANTS_ENABLED) {
      const params = new URLSearchParams(filters as any).toString();
      return await apiClient.get<Restaurant[]>(`/restaurants?${params}`);
    } else {
      return await MockDataService.getAllRestaurants();
    }
  }

  async getRestaurantById(id: number): Promise<Restaurant> {
    if (FEATURE_FLAGS.USE_REAL_API && FEATURE_FLAGS.RESTAURANTS_ENABLED) {
      return await apiClient.get<Restaurant>(`/restaurants/${id}`);
    } else {
      return await MockDataService.getRestaurantById(id);
    }
  }

  async addToList(
    restaurantId: number,
    status: 'been' | 'want_to_try' | 'recommended',
    data?: { rating?: number; notes?: string }
  ): Promise<void> {
    if (FEATURE_FLAGS.USE_REAL_API && FEATURE_FLAGS.RESTAURANTS_ENABLED) {
      await apiClient.post(`/users/me/lists/${status}/restaurants`, {
        restaurantId,
        ...data,
      });
    } else {
      await MockDataService.addRestaurantToUserList(restaurantId, status, data);
    }
  }

  async removeFromList(restaurantId: number, status: string): Promise<void> {
    if (FEATURE_FLAGS.USE_REAL_API && FEATURE_FLAGS.RESTAURANTS_ENABLED) {
      await apiClient.delete(`/users/me/lists/${status}/restaurants/${restaurantId}`);
    } else {
      await MockDataService.removeRestaurantFromUserList(restaurantId, status);
    }
  }
}

export default new RestaurantService();
```

#### 3.4 Update Restaurant Screens

Replace all MockDataService calls in:
- `SearchScreen.tsx`
- `RestaurantInfoScreen.tsx`
- `ListsScreen.tsx`

#### 3.5 Enable Feature Flag

```typescript
export const FEATURE_FLAGS = {
  USE_REAL_API: true,
  AUTH_ENABLED: true,
  RESTAURANTS_ENABLED: true, // ✅ Enable
  SOCIAL_ENABLED: false,
};
```

---

## Phase 4: Social Features

### Week 7-8: Feed, Following, Leaderboard

#### 4.1 Backend: Implement Social Endpoints

See [backend-api-spec.md](./backend-api-spec.md) Sections 6-7.

**Key endpoints**:
- `GET /feed`
- `POST /users/:id/follow`
- `GET /users/:id/followers`
- `GET /users/:id/match`
- `GET /leaderboard`

#### 4.2 Implement WebSocket for Real-Time Updates

**Backend**: `src/websocket/websocket.gateway.ts`

```typescript
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Authenticate client
    const token = client.handshake.auth.token;
    const userId = this.verifyToken(token);

    if (!userId) {
      client.disconnect();
      return;
    }

    // Join user's personal room
    client.join(`user:${userId}`);
  }

  // Emit to specific user
  emitToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast notification
  broadcastNotification(userId: number, notification: any) {
    this.emitToUser(userId, 'notification:new', notification);
  }
}
```

**Mobile**: `beli-native/src/services/websocketClient.ts`

```typescript
import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketClient {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('accessToken');

    this.socket = io('wss://api.beli.app', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('notification:new', (notification) => {
      // Handle notification (show toast, update badge)
      console.log('New notification:', notification);
    });

    this.socket.on('feed:update', (activity) => {
      // Refresh feed
      console.log('New activity:', activity);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new WebSocketClient();
```

#### 4.3 Mobile: Create Social Service

```typescript
class SocialService {
  async getFeed(cursor?: string): Promise<{ items: FeedItem[], nextCursor?: string }> {
    if (FEATURE_FLAGS.USE_REAL_API && FEATURE_FLAGS.SOCIAL_ENABLED) {
      return await apiClient.get<any>(`/feed?cursor=${cursor || ''}`);
    } else {
      const items = await MockDataService.getActivityFeed();
      return { items };
    }
  }

  async followUser(userId: number): Promise<void> {
    if (FEATURE_FLAGS.USE_REAL_API && FEATURE_FLAGS.SOCIAL_ENABLED) {
      await apiClient.post(`/users/${userId}/follow`);
    } else {
      await MockDataService.followUser(userId);
    }
  }

  // ... more methods
}
```

#### 4.4 Enable Feature Flag

```typescript
export const FEATURE_FLAGS = {
  USE_REAL_API: true,
  AUTH_ENABLED: true,
  RESTAURANTS_ENABLED: true,
  SOCIAL_ENABLED: true, // ✅ Enable
};
```

---

## Phase 5: Complex Features

### Week 9-11: Group Dinner, What to Order, Tastemakers

#### 5.1 Backend: Implement Complex Endpoints

See [backend-api-spec.md](./backend-api-spec.md) Sections 9-10.

Implement business logic from [backend-business-logic.md](./backend-business-logic.md):
- Group dinner matching algorithm
- "What to Order" recommendation engine
- Tastemaker post management

#### 5.2 Mobile: Create Feature Services

```typescript
class GroupDinnerService {
  async createMatchSession(
    participantIds: number[],
    date: Date,
    dietaryRestrictions: string[]
  ): Promise<GroupMatch[]> {
    if (FEATURE_FLAGS.USE_REAL_API) {
      return await apiClient.post('/groups/matches', {
        participantIds,
        date,
        dietaryRestrictions,
      });
    } else {
      return await MockDataService.findGroupMatches(participantIds);
    }
  }
}

class WhatToOrderService {
  async getRecommendations(
    restaurantId: number,
    partySize: number,
    hungerLevel: string
  ): Promise<OrderSuggestion> {
    if (FEATURE_FLAGS.USE_REAL_API) {
      return await apiClient.get(`/restaurants/${restaurantId}/recommendations`, {
        params: { partySize, hungerLevel },
      });
    } else {
      return await MockDataService.getWhatToOrderSuggestion(restaurantId, partySize, hungerLevel);
    }
  }
}
```

---

## Phase 6: Real-time & Polish

### Week 12: Final Features

#### 6.1 Push Notifications

**Setup**:
1. Configure Firebase Cloud Messaging (FCM) for mobile
2. Store device tokens in database
3. Send push notifications on important events

**Backend**: Use `firebase-admin` SDK

```typescript
import * as admin from 'firebase-admin';

async function sendPushNotification(userId: number, notification: any) {
  const deviceToken = await db.getUserDeviceToken(userId);

  if (deviceToken) {
    await admin.messaging().send({
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
    });
  }
}
```

#### 6.2 Analytics Integration

**Mobile**: Add analytics tracking

```typescript
import analytics from '@react-native-firebase/analytics';

// Track events
await analytics().logEvent('restaurant_viewed', {
  restaurant_id: restaurant.id,
  restaurant_name: restaurant.name,
});

await analytics().logEvent('list_added', {
  restaurant_id: restaurant.id,
  list_type: 'been',
});
```

**Backend**: Log API usage

```typescript
// Middleware to log all requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });
  });

  next();
});
```

#### 6.3 Error Handling & Monitoring

**Setup Sentry**:

```bash
npm install @sentry/react-native
```

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});

// Catch errors
try {
  await apiClient.post('/endpoint');
} catch (error) {
  Sentry.captureException(error);
  // Show user-friendly error
}
```

#### 6.4 Remove MockDataService

Once all features migrated:

1. Delete `MockDataService` class
2. Remove `FEATURE_FLAGS` (everything uses real API)
3. Clean up mock data files

---

## Testing Strategy

### Unit Tests

**Backend**:
```bash
npm run test

# Example: Test auth service
describe('AuthService', () => {
  it('should create user and return JWT', async () => {
    const result = await authService.signup(
      'test@example.com',
      'password123',
      'testuser',
      'Test User'
    );

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });
});
```

**Mobile**:
```bash
npm run test

# Example: Test restaurant service
describe('RestaurantService', () => {
  it('should fetch restaurants', async () => {
    const restaurants = await restaurantService.getRestaurants();
    expect(restaurants.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test API endpoints with real database:

```typescript
describe('POST /auth/signup', () => {
  it('should create new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'new@example.com',
        password: 'SecurePass123',
        username: 'newuser',
        displayName: 'New User',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('new@example.com');
  });
});
```

### End-to-End Tests

Use Detox (React Native) or Maestro:

```yaml
# maestro/signup-flow.yaml
appId: com.beli.app
---
- launchApp
- tapOn: "Sign Up"
- inputText: "test@example.com"
- tapOn: "Next"
- inputText: "password123"
- tapOn: "Create Account"
- assertVisible: "Welcome to Beli!"
```

---

## Rollback Plan

### If Issues Arise

1. **Toggle feature flag off**:
   ```typescript
   FEATURE_FLAGS.RESTAURANTS_ENABLED = false;
   ```

2. **Revert to previous version**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Database rollback**:
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

4. **Communicate with users**: Send in-app notification

---

## Monitoring & Alerts

### Key Metrics to Track

1. **API Performance**:
   - Response time (p50, p95, p99)
   - Error rate
   - Request rate

2. **Database**:
   - Query performance
   - Connection pool usage
   - Slow queries

3. **App Health**:
   - Crash rate
   - API success rate
   - User engagement

### Set Up Alerts

**Example (Datadog/New Relic)**:
- Alert if API error rate > 5%
- Alert if p95 response time > 1 second
- Alert if database connections > 80%

---

## Post-Migration Checklist

- [ ] All MockDataService references removed
- [ ] Feature flags removed
- [ ] All tests passing
- [ ] Monitoring and alerts configured
- [ ] Documentation updated
- [ ] Team trained on new backend
- [ ] Rollback plan tested
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Backup and recovery tested

---

## Next Steps

1. Review all backend documentation:
   - [backend-architecture.md](./backend-architecture.md)
   - [backend-api-spec.md](./backend-api-spec.md)
   - [backend-database-schema.md](./backend-database-schema.md)
   - [backend-business-logic.md](./backend-business-logic.md)

2. Set up development environment
3. Start Phase 0 preparation
4. Follow migration phases incrementally
5. Test thoroughly at each phase
6. Deploy to production gradually (e.g., 10% of users first)

---

## Support & Resources

- **NestJS Documentation**: https://docs.nestjs.com/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **React Native Best Practices**: https://reactnative.dev/docs/best-practices
- **PostgreSQL Performance**: https://www.postgresql.org/docs/current/performance-tips.html

For questions or issues during migration, refer to the documentation or reach out to the team.
