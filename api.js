const mysql = require('mysql');
const md5 = require('md5');

class database {
  constructor() {}
  static create(){
    let message = "Creating mysql connection...";
    this.connection = mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DBUSER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
    })
    this.connection.connect();
    console.log(message + 'ok');
  }
}

module.exports = {database};