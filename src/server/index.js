const express = require("express");
const path = require("path");
const api = require("./api");

const app = express();
const port = 8000;

app.use("/api", api);

app.use(express.static(path.join(__dirname, '../client/build')));

app.get("/", function (req, res) {
	res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
