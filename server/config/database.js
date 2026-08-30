const mysql = require("mysql2");

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,

  user: process.env.DB_USER,

  port: Number(process.env.DB_PORT),

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed", err);

    return;
  }

  console.log("MySQL Connected Successfully ✅");
});

module.exports = connection;
