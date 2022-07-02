import express from "express";
import mongoose from "mongoose";
import router from "./routes/user-routes.js";
import cookieParser from "cookie-parser";

// app variable holds all the functionalities with the application
const app = express();

//
app.use(cookieParser()); //Call the cookieParser
app.use(express.json()); //Send json data to the server
app.use("/api", router);

// Connect the database
mongoose
  .connect(
    "mongodb+srv://ishan:kaimkdscc@cluster0.ewiyymx.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    //Whenever the connection Succeded
    app.listen(process.env.PORT || 5000);
    console.log("Database Connected");
    console.log(`Running on PORT ${process.env.PORT || 5000}`);
  })
  .catch((err) => {
    // If there is an error while connecting to the database
    console.log(err);
  });
