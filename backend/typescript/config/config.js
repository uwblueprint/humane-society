require('dotenv').config();


const common = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'db', // name of the DB service in docker-compose
  port: Number(process.env.POSTGRES_DB_PORT || 5432),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB_DEV || 'humane_society_dev',
  logging: false,
  define: {
    underscored: true,     // set true if your tables/columns use snake_case
    freezeTableName: false
  }
};

module.exports = {
  development: common,
  test: { ...common, database: process.env.POSTGRES_DB_TEST || `${common.database}_test` },
  production: { ...common, logging: false }
};
