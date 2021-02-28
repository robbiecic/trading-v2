const { DB_HOST, DB_PASSWORD, DB_PORT, DB_SCHEMA, DB_USER, NODE_ENV } = process.env;

module.exports = {
  type: "mysql",
  host: DB_HOST || "localhost",
  port: DB_PORT || 3306,
  username: DB_USER || "root",
  password: DB_PASSWORD || "password",
  database: DB_SCHEMA || "trading",
  synchronize: true,
  logging: false,
  entities: NODE_ENV == "dev" ? ["built/entity/**/*.js"] : ["entity/**/*.js"],
};
