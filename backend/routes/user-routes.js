import express from "express";
import {
  signUp,
  login,
  verifyToken,
  getUser,
} from "../controllers/user-controller.js";

const router = express.Router();

router.post("/signup", signUp); //User signup
router.post("/login", login); //User login
router.get("/user", verifyToken, getUser); //After verification is completed go to getUser  - {get all the details of ther user}

// Verify token
// We need to keep the user logged in  , if the user is still available on the website
export default router;
