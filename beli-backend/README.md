# Beli Backend API

Django REST Framework backend for the Beli restaurant discovery app.

## Tech Stack

- **Django 5.0** + **Django REST Framework**
- **PostgreSQL 15+** with **PostGIS** extension (geospatial queries)
- **Redis** (caching + sessions)
- **Python 3.11+**

## Architecture

```
Hybrid Architecture:
- PostgreSQL: Primary data store (relational data)
- Redis: Caching layer (feeds, leaderboards, match percentages)
- Django Monolith: All services in one application
```

## Setup

### Prerequisites

1. **Python 3.11+**
2. **PostgreSQL 15+** with PostGIS extension
3. **Redis 7+**

### Installation

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# 4. Create PostgreSQL database with PostGIS
createdb beli_db
psql beli_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Load seed data
python manage.py seed_restaurants

# 8. Run development server
python manage.py runserver
```

## API Endpoints

### Restaurants

- `GET /api/restaurants/` - List all restaurants (with pagination)
- `GET /api/restaurants/{id}/` - Get restaurant details
- `GET /api/restaurants/search/?q=pizza` - Search restaurants
- `GET /api/restaurants/nearby/?lat=40.7580&lng=-73.9855&radius=2` - Nearby restaurants
- `GET /api/restaurants/trending/` - Trending restaurants

### Coming Soon

- Users & Authentication
- Lists (Been, Want-to-try, Recommendations)
- Social Feed
- Reviews & Ratings
- Tastemakers
- Group Dinner matching

## Project Structure

```
beli-backend/
├── config/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── restaurants/     # Restaurant domain
│   ├── users/          # User management (TODO)
│   ├── social/         # Feed, follows (TODO)
│   └── lists/          # User lists (TODO)
├── common/             # Shared utilities
│   ├── cache.py        # Redis caching helpers
│   └── pagination.py   # Custom pagination
├── manage.py
└── requirements.txt
```

## Development

```bash
# Run tests
pytest

# Format code
black .

# Run linter
flake8

# Create new migration
python manage.py makemigrations

# Django shell with IPython
python manage.py shell_plus
```

## Database Design Philosophy

**Denormalized "Fat Model" Approach:**
- Restaurant data stored in single table with embedded location/hours
- Optimized for read-heavy workload (95% reads)
- JSON fields for flexible data (hours, tags, images)
- PostGIS for geospatial queries

**Why not microservices?**
- Early stage: Monolith = faster iteration
- Clear upgrade path: Extract services later when needed
- Most apps don't need microservices until 1M+ DAU

## Performance

- Target: <100ms API response time
- Redis caching for hot data
- Database indexing on common queries
- PostGIS spatial indexes for location queries

## Contributing

See main project README for contribution guidelines.
