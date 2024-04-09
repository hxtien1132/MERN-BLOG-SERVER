const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const dbConnect = require("./config/connect");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
require("dotenv").config();
const upload = require("express-fileupload");
const createFile = require("./config/file");
// var path = require("path");
const app = express();

dbConnect();
createFile();
app.use(upload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cors({ credentials: true, origin: "https://mern-blog-client-sage.vercel.app" }));

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server run in port ${PORT}`));
