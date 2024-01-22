const express = require("express");
const router = express.Router();
const databaseController = require("../../Controller/databaseController");

router.get("/getRow", databaseController.getRow);
router.get("/deleteRow", databaseController.DeleteRowFromUsers);
router.delete("/DropTable", databaseController.DropTable);

router.post("/insertIntoBfs", databaseController.insertIntoBfs);
router.get("/bfsQuery", databaseController.bfsQuery);
router.get("/queryResult", databaseController.QueryResultTable);

router.get("/allRows", databaseController.getAllRows);
router.post("/insert", databaseController.insertIntoTable);
router.post("/createTable", databaseController.createTableQuery);

module.exports = router;