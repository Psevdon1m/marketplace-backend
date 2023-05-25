const mysql = require("mysql2");

//Creating MySQL connection
const connection = mysql
  .createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  })
  .promise();

async function getUserByAddress(address) {
  const sql = "SELECT * FROM table_name WHERE address = ?";
  const [result] = await connection.query(sql, [address]);
  return result[0];
}

module.exports.getUserByAddress = getUserByAddress;
