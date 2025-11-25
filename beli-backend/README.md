# Beli Django Backend

Django REST API backend for the Beli restaurant rating app. Connects to the existing Supabase PostgreSQL database.

## Quick Start

### 1. Set up Python environment

```bash
cd beli-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Supabase database URL
# DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```

### 3. Run the server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1/`

## API Endpoints

### Restaurants

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/restaurants/` | GET | List all restaurants |
| `/api/v1/restaurants/{id}/` | GET | Get single restaurant |
| `/api/v1/restaurants/search/` | GET | Search restaurants |
| `/api/v1/restaurants/trending/` | GET | Get trending restaurants |
| `/api/v1/restaurants/batch/` | POST | Get multiple by IDs |
| `/api/v1/restaurants/random/` | GET | Get random restaurants |

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users/` | GET | List all users |
| `/api/v1/users/{id}/` | GET | Get single user |
| `/api/v1/users/me/` | GET | Get current user |
| `/api/v1/users/search/` | GET | Search users |
| `/api/v1/users/leaderboard/` | GET | Get leaderboard |
| `/api/v1/users/{id}/followers/` | GET | Get user's followers |
| `/api/v1/users/{id}/following/` | GET | Get users followed |
| `/api/v1/users/{id}/ratings/` | GET | Get user's ratings |
| `/api/v1/users/{id}/watchlist/` | GET | Get user's watchlist |
| `/api/v1/users/{id}/match/{targetId}/` | GET | Get match percentage |

## Using with the Frontend

### Enable Django in Next.js

Add to your `.env.local`:

```env
NEXT_PUBLIC_DATA_PROVIDER=django
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api/v1
```

### Toggle Modes

- `django` - Use Django REST API
- `supabase` - Use Supabase SDK (default)
- `mock` - Use mock data
- `auto` - Try Supabase, fall back to mock

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │ →   │  Django API     │ →   │  Supabase       │
│   localhost:3000│     │  localhost:8000 │     │  PostgreSQL     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

Django uses `managed=False` models to read/write the existing Supabase tables without creating migrations.

## Project Structure

```
beli-backend/
├── config/             # Django settings
│   ├── settings.py     # Main configuration
│   ├── urls.py         # Root URL routing
│   └── wsgi.py
├── apps/
│   ├── restaurants/    # Restaurant API
│   │   ├── models.py   # Restaurant model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── users/          # User API
│   │   ├── models.py   # User, Rating, UserFollow models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services.py # Match % algorithm
│   └── core/           # Shared utilities
├── manage.py
├── requirements.txt
└── .env.example
```
