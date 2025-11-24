# Beli Backend Setup Guide

Quick setup guide to get the Django backend running.

## Prerequisites

Before you begin, ensure you have installed:

1. **Python 3.11+**
   ```bash
   python3 --version  # Should be 3.11 or higher
   ```

2. **PostgreSQL 15+** with **PostGIS** extension
   ```bash
   # macOS (Homebrew):
   brew install postgresql postgis
   brew services start postgresql

   # Ubuntu/Debian:
   sudo apt-get install postgresql postgresql-contrib postgis
   sudo systemctl start postgresql
   ```

3. **Redis 7+**
   ```bash
   # macOS (Homebrew):
   brew install redis
   brew services start redis

   # Ubuntu/Debian:
   sudo apt-get install redis-server
   sudo systemctl start redis
   ```

## Installation Steps

### 1. Create Virtual Environment

```bash
cd beli-backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql postgres

# In psql prompt:
CREATE DATABASE beli_db;
\c beli_db
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

**Or use this one-liner:**
```bash
createdb beli_db
psql beli_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 4. Configure Environment Variables

The `.env` file is already created with development defaults. Review and update if needed:

```bash
# Edit .env if your database credentials differ
# Default username/password: postgres/postgres
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

Expected output:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying restaurants.0001_initial... OK
  ...
```

### 6. Create Admin User

```bash
python manage.py createsuperuser

# Follow prompts to set:
# - Username
# - Email
# - Password
```

### 7. Seed Sample Data

```bash
python manage.py seed_restaurants
```

Expected output:
```
✓ Created: Joe's Pizza
✓ Created: Le Bernardin
✓ Created: Shake Shack
✓ Created: Momofuku Noodle Bar
✓ Created: Blue Bottle Coffee
✓ Successfully seeded 5 restaurants!
```

### 8. Run Development Server

```bash
python manage.py runserver
```

Server will start on **http://localhost:8000**

## Verify Installation

### 1. Check API is Running

```bash
curl http://localhost:8000/api/restaurants/
```

Should return JSON with restaurant data.

### 2. Access Django Admin

1. Navigate to **http://localhost:8000/admin/**
2. Login with superuser credentials
3. Browse restaurants and menu items

### 3. Test API Endpoints

```bash
# List all restaurants
curl http://localhost:8000/api/restaurants/

# Get specific restaurant
curl http://localhost:8000/api/restaurants/{id}/

# Search restaurants
curl "http://localhost:8000/api/restaurants/search/?q=pizza&city=New%20York"

# Nearby restaurants (geospatial query)
curl "http://localhost:8000/api/restaurants/nearby/?lat=40.7580&lng=-73.9855&radius=2"

# Trending restaurants
curl http://localhost:8000/api/restaurants/trending/

# Restaurant menu
curl http://localhost:8000/api/restaurants/{id}/menu/
```

## API Documentation

Once running, explore the API at:

- **Browsable API**: http://localhost:8000/api/restaurants/
- **Admin Interface**: http://localhost:8000/admin/

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/` | List all restaurants (paginated) |
| GET | `/api/restaurants/{id}/` | Get restaurant details |
| GET | `/api/restaurants/search/` | Search with filters |
| GET | `/api/restaurants/nearby/` | Geospatial nearby search |
| GET | `/api/restaurants/trending/` | Trending restaurants |
| GET | `/api/restaurants/{id}/menu/` | Restaurant menu items |
| GET | `/api/restaurants/{id}/recommendations/` | Similar restaurants |

### Query Parameters

**Search (`/api/restaurants/search/`):**
- `q` - Text search (name, cuisine, tags, dishes)
- `cuisine` - Filter by cuisine
- `price_range` - Filter by price ($, $$, $$$, $$$$)
- `city` - Filter by city
- `neighborhood` - Filter by neighborhood
- `category` - Filter by category
- `min_rating` - Minimum rating (0.0-10.0)
- `tags` - Filter by tags (comma-separated)
- `ordering` - Sort order (name, -rating, created_at)
- `page` - Page number
- `page_size` - Results per page (max 100)

**Nearby (`/api/restaurants/nearby/`):**
- `lat` - Latitude (required)
- `lng` - Longitude (required)
- `radius` - Search radius in miles (default: 2.0)
- `limit` - Max results (default: 20)
- `min_rating` - Minimum rating

## Troubleshooting

### Issue: `psycopg2` installation fails

**Solution:** Install PostgreSQL development headers
```bash
# macOS:
brew install postgresql

# Ubuntu/Debian:
sudo apt-get install libpq-dev python3-dev

# Then reinstall:
pip install psycopg2-binary
```

### Issue: PostGIS extension not found

**Solution:** Install PostGIS
```bash
# macOS:
brew install postgis

# Ubuntu/Debian:
sudo apt-get install postgis postgresql-15-postgis-3
```

### Issue: Redis connection refused

**Solution:** Start Redis server
```bash
# macOS:
brew services start redis

# Ubuntu/Debian:
sudo systemctl start redis

# Verify Redis is running:
redis-cli ping  # Should return "PONG"
```

### Issue: Migration errors

**Solution:** Reset database
```bash
# Drop and recreate database
dropdb beli_db
createdb beli_db
psql beli_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations again
python manage.py migrate
python manage.py seed_restaurants
```

## Next Steps

1. **Add Authentication**: Implement JWT authentication for users
2. **Build User API**: Create User model and endpoints
3. **Add Social Features**: Build Feed, Lists, and Social relationships
4. **Implement Caching**: Add Redis caching for hot queries
5. **Connect Frontend**: Update Next.js/React Native to use real API

## Development Tools

```bash
# Django shell with IPython
python manage.py shell_plus

# View all URLs
python manage.py show_urls

# Run tests
pytest

# Format code
black .

# Lint code
flake8
```

## Production Deployment

See main README for production deployment guide (Docker, AWS, Heroku, etc.)
