# Database Seeding

This directory contains seed files for populating the database with mock data for development purposes.

## Prerequisites

- Faker.js is installed: `@faker-js/faker`
- Sequelize CLI is installed: `sequelize-cli`
- Database is properly configured and migrations have been run

## Seed Files

### 1. Activity Types (`20250616160625-demo-activity-types.ts`)
Seeds the `activity_types` table with common animal care activities:
- Dog Walking
- Cat Playtime
- Basic Training
- Kennel Cleaning
- Feeding Time
- Bird Socialization
- Bunny Exercise
- Small Animal Care
- General Assessment

### 2. Users (`20250616160626-demo-users.ts`)
Seeds the `users` table with 8 mock users:
- 2 Administrators (including real UW Blueprint members)
- 2 Animal Behaviourists
- 2 Staff members
- 2 Volunteers (including real UW Blueprint member)

Each user has:
- Realistic fake data generated with Faker.js
- Appropriate role permissions
- Animal tag assignments
- Color level assignments (1-5)

### 3. Pets (`20250616160627-demo-pets.ts`)
Seeds the `pets` table with 25 pets (5 of each animal type):
- 5 Dogs
- 5 Cats
- 5 Birds
- 5 Bunnies
- 5 Small Animals

Each pet has:
- Realistic breed for their animal type
- Random birthday (up to 10 years old)
- Appropriate weight range for animal type
- Random status, sex, and other attributes

### 4. Activities (`20250616160628-demo-activities.ts`)
Seeds the `activities` table with 30 mock activities:
- Various completion states (scheduled, in-progress, completed)
- Random assignments to users and pets
- Realistic time ranges
- Some activities left unassigned (10%)

## Running Seeds

### Run all seeds:
```bash
npm run db:seed
```

### Undo all seeds:
```bash
npm run db:seed:undo
```

### Using npm scripts:
```bash
# Run all seeds
npm run sequelize db:seed:all

# Undo all seeds  
npm run sequelize db:seed:undo:all
```

## Important Notes

1. **Order Matters**: Seeds must be run in the correct order:
   - Activity Types first (required for activities)
   - Users second (required for activities)
   - Pets third (required for activities)
   - Activities last (depends on all others)

2. **Firebase Auth**: The user seeds include some real Firebase auth IDs for testing. These correspond to actual UW Blueprint team members.

3. **Realistic Data**: All data is generated using Faker.js to provide realistic but fake information for development and testing.

4. **Foreign Key Relationships**: The activities seeder assumes specific ID ranges based on the number of users, pets, and activity types created by the other seeders.

## Troubleshooting

- Ensure your database is running and accessible
- Make sure all migrations have been applied before seeding
- Check that environment variables are properly configured
- If seeding fails, try undoing seeds and running them again in order
