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
router.get("/user", verifyToken, getUser);

export default router;
