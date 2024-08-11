const connectToMongo = require('./db');
const express = require('express');

connectToMongo();

const app = express()
const port = 5000

app.use(express.json()); // if we want to send request body we need to add this code

app.use("/api/auth", require("./routes/auth"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});