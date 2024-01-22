const express = require("express");
var DB = require("./routes/api/database");
const mongoose = require("mongoose");
const cors = require("cors");
const { spawn, execFile } = require("child_process");
const bodyParser = require("body-parser");
const pg = require("pg");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/postgres/", DB);

// spawn new child process to call the python script
// const python = spawn("python", ["../data-processing/dataprocessing_script.py"]);
//
// python.stderr.on("data", (data) => {
//   // As said before, convert the Uint8Array to a readable string.
//   console.log(data.toString(data));
// });
//
// python.on("exit", function (code, signal) {
//   console.log(
//     "child process exited with " + `code ${code} and signal ${signal}`
//   );
// });
//
// execFile("./databasedump.sh", (stdout, stderr, error) => {
//   if (error) {
//     console.log(`Error: ${error}`);
//     return;
//   }
//   if (stderr) {
//     console.log(`Error: ${stderr}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
// });

// client
//   .connect()
//   .then(() => console.log("Connected to PostgreSQL"))
//   .catch((err) => console.log(err));

// createTableQuery();
//  insertIntoTable("('youssef', 24)");
// QueryResultTable();
// bfsQuery();

// mongoose
//   .connect(
//     "mongodb+srv://admin:admin@cluster0.ll6tz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
//     {
//       useNewUrlParser: true,
//       // useFindAndModify: false,
//       // useCreateIndex: true,
//       // useUnifiedTopology: true
//     }
//   )
//   .then(() => console.log("Connected to mongoDB"))
//   .catch((err) => console.log(err));

app.use((req, res) => {
  res.status(404).send({ err: "We can not find what you are looking for" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server up and running on port ${port}`));
