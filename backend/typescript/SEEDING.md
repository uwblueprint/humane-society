# Database Seeding Guide

This guide provides complete instructions for setting up and using database seeding in the UW Blueprint Humane Society project.

## Overview

Database seeding populates your development database with realistic mock data, making it easier to develop and test features without manually creating data each time.

## What Gets Seeded

- **9 Activity Types**: Common animal care activities (Dog Walking, Cat Playtime, Training, etc.)
- **8 Users**: 2 Administrators, 2 Animal Behaviourists, 2 Staff, 2 Volunteers
- **25 Pets**: 5 each of Dogs, Cats, Birds, Bunnies, and Small Animals
- **30 Activities**: Various completion states and assignments

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd backend/typescript
./setup-seeds.sh
```

This script will:
- Check and install dependencies
- Verify database connection
- Run migrations if needed
- Execute all seed files in the correct order

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   cd backend/typescript
   npm install @faker-js/faker
   npm install -D sequelize-cli
   ```

2. **Configure Environment**
   ```bash
   # Copy example environment file
   cp ../../.env.example ../../.env
   # Edit .env with your database credentials
   ```

3. **Run Migrations**
   ```bash
   npm run sequelize db:migrate
   ```

4. **Run Seeds**
   ```bash
   npm run db:seed
   ```

## Environment Setup

### Database Configuration

Create a `.env` file in the project root with these variables:

```bash
# Database Configuration
DB_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB_DEV=humane_society_dev
POSTGRES_DB_TEST=humane_society_test
NODE_ENV=development
```

### Docker Setup

If using Docker for development:

```bash
# Start the database
docker-compose up db

# In another terminal, run seeds
cd backend/typescript
npm run db:seed
```

### Local PostgreSQL Setup

If using local PostgreSQL:

1. Install PostgreSQL
2. Create databases:
   ```sql
   CREATE DATABASE humane_society_dev;
   CREATE DATABASE humane_society_test;
   ```
3. Update `.env` with your local PostgreSQL credentials

## Available Commands

```bash
# Run all seeds
npm run db:seed

# Undo all seeds (removes seeded data)
npm run db:seed:undo

# Using sequelize directly
npm run sequelize db:seed:all
npm run sequelize db:seed:undo:all

# Check migration status
npm run sequelize db:migrate:status

# Run migrations
npm run sequelize db:migrate
```

## Seed Files Details

### 1. Activity Types (`20250616160625-demo-activity-types.ts`)
Creates 9 common activity types across all categories:
- **Walk**: Dog Walking
- **Games**: Cat Playtime, Bunny Exercise
- **Training**: Basic Training
- **Husbandry**: Kennel Cleaning, Feeding Time, Small Animal Care
- **Pen Time**: Bird Socialization
- **Misc.**: General Assessment

### 2. Users (`20250616160626-demo-users.ts`)
Creates 8 users with realistic roles and permissions:

**Administrators** (can see all logs, assign tasks):
- Mehul Sharma (mehulsharma@uwblueprint.org) - Real Firebase auth ID
- Gateen Chandak (gateekchandak@uwblueprint.org) - Real Firebase auth ID

**Animal Behaviourists** (can see all logs):
- Dr. Sarah Johnson
- Dr. Michael Roberts

**Staff** (can assign tasks):
- Emma Wilson
- James Anderson

**Volunteers**:
- Lisa Thompson
- David Lu (davidlu@uwblueprint.org) - Real Firebase auth ID

### 3. Pets (`20250616160627-demo-pets.ts`)
Creates 25 pets (5 of each type) with:
- Realistic breeds for each animal type
- Random ages, weights, and characteristics
- Appropriate weight ranges:
  - Dogs: 10-80 lbs
  - Cats: 3-15 lbs
  - Birds: 0.1-2 lbs
  - Bunnies: 1-8 lbs
  - Small Animals: 0.5-5 lbs

### 4. Activities (`20250616160628-demo-activities.ts`)
Creates 30 activities with varied states:
- 40% completed activities
- Some in-progress activities
- 10% unassigned activities
- Realistic time ranges and notes

## Firebase Integration

The user seeds include real Firebase authentication IDs for UW Blueprint team members:
- `tKRqSeQRQDbtb732noTEkIs5ES73` - Mehul Sharma
- `IYHqIgVmCThBAHg2D3WZeLQoqAo1` - Gateen Chandak  
- `NR6IuoDtciczCX3zpKMJceRWC2y2` - David Lu

This allows for realistic testing with actual authentication.

## Troubleshooting

### Common Issues

**Database Connection Error**
```
ERROR: getaddrinfo ENOTFOUND humane_society_db
```
- Ensure PostgreSQL is running
- Check `.env` file configuration
- Verify `DB_HOST` is correct (`localhost` for local, `humane_society_db` for Docker)

**Migration Errors**
```
No migrations were executed, database schema was already up to date
```
- This is normal if migrations are already applied
- Run `npm run sequelize db:migrate:status` to check

**Sequelize CLI Not Found**
```
/bin/sh: sequelize: command not found
```
- Install sequelize-cli: `npm install -D sequelize-cli`
- Use full path: `npm run sequelize` instead of just `sequelize`

**Foreign Key Constraint Errors**
- Ensure seeds run in correct order (activity-types → users → pets → activities)
- Check that referenced tables have data
- Verify ID ranges in activities seeder match actual data

### Reset and Retry

If seeding fails or you want to start fresh:

```bash
# Remove all seeded data
npm run db:seed:undo

# Re-run all seeds
npm run db:seed
```

## Development Workflow

1. **Initial Setup**: Run seeds once after cloning the repository
2. **Schema Changes**: After running new migrations, you may need to re-seed
3. **Testing**: Use seeded data for feature development and testing
4. **Reset**: Periodically reset seeds to ensure consistency

## Advanced Usage

### Custom Seed Data

To modify seeded data:
1. Edit the relevant seed file in `seeders/`
2. Run `npm run db:seed:undo` to remove existing data
3. Run `npm run db:seed` to apply changes

### Production Considerations

- **Never run seeds in production**
- Seeds are for development and testing only
- Production data should use proper data migration scripts

## Contributing

When adding new seed files:
1. Use meaningful timestamps for ordering: `YYYYMMDDHHMMSS-description.ts`
2. Include proper TypeScript types
3. Follow existing patterns for data generation
4. Add foreign key relationships appropriately
5. Update this documentation

For questions or issues, contact the UW Blueprint development team.
