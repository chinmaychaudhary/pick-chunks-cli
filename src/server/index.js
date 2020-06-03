const express = require("express");
// const path = require("path");
const api = require("./api");

const app = express();
const port = 3000;

// app.use('/assets/', express.static(path.join()));

app.use("/api", api);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
