import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MailSender from "../mailSender.js";
import moment from "moment";
const JWT_SECRET_KEY = "SECRET";

// req
// what we receive from the user

// res
// what we get from the server side

// next
// to which middleware we should move on after completing a certain task

const signUp = async (req, res, next) => {
  // ==============================Validation==================================
  let existingUser;
  const { name, email, password } = req.body; //All the data is coming from req.body and get those details as name , email , password
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }
  if (existingUser) {
    return res
      .status(400)
      .json({ mesaage: "User Already Exists! Login Instead" });
  }
  // ==============================================================================
  // ============================Create a new user=================================
  const user = new User({
    name, //name : name
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password), //Send the password encrypted
  });

  try {
    // Save the new user in the database
    await user.save();

    // Retrieve the mail from the database
    const userMail = await User.findOne({ email: email.toLowerCase() });
    // Otherwise we can also use just 'email' from req.body

    // console.log(userMail.email, typeof userMail.email);
    // Send the user a mail from the system
    new MailSender(
      [userMail.email],
      moment().add(5, "s").format(),
      "Administrator",
      "admin"
    ).sendEmail();
  } catch (err) {
    // If there is an error occured while saving to the database log it to the console
    console.log(err);
  }

  // Reg Success
  return res.status(201).json({ mesaage: user });
};

// ======================================================================
// Login Function
const login = async (req, res, next) => {
  // Get the name and the password from the request.body
  const { email, password } = req.body;

  let existingUser; //to check whether , is there an already available user
  try {
    existingUser = await User.findOne({ email: email.toLowerCase() });
  } catch (err) {
    return new Error(err);
  }

  //If the user is not avaialable in the database
  if (!existingUser) {
    return res.status(400).json({ mesaage: "User NOT Found!" });
  }

  //   Checking for the password
  //   Comapare the req.password with the password from the database
  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);

  //   If the password is invalid
  if (!isPasswordCorrect) {
    return res
      .status(400)
      .json({ mesaage: "username and password does not match!" });
  }

  //Create a token for the logged user
  const token = jwt.sign({ id: existingUser._id }, JWT_SECRET_KEY, {
    expiresIn: "30s",
  });

  // Creating a cookie
  res.cookie(String(existingUser._id), token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 30), //Create a cookie valid only for 30secs
    // maxAge: 1000 * 30,
    httpOnly: true,
    sameSite: "lax",
  });

  //   If the password is correct
  return res
    .status(200)
    .json({ mesaage: "logged in Successfully!", existingUser, token });
};

// =============================================================================================
// ============================Verify Token======================================
const verifyToken = async (req, res, next) => {
  const cookieReceived = req.headers.cookie;
  //console.log(cookieReceived); //We get user.id=token as the cookie , so we need to split it by = sign
  // Get the first index then we will get the token
  const bearerToken = cookieReceived.split("=")[1];
  console.log(bearerToken);

  //   If the token is not available
  if (!bearerToken) {
    return res.status(404).json({ message: "NO TOKEN!!" });
  }

  //   Token verification
  jwt.verify(String(bearerToken), JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // console.log(bearerToken);
    console.log(user.id);
    req.id = user.id; //Set the req.token by using the decoded details
  });

  //   After completing the process go to the next middleware
  next();
};

// ===========================================================================================
// ==============================get user details=========================================
const getUser = async (req, res, next) => {
  const userID = req.id; //Get the req.id which was send from the verify token
  let user;
  try {
    user = await User.findById(userID, "-password"); //Get all the details of the user instead of the password
  } catch (err) {
    return new Error(err);
  }

  //   If the user is not found
  if (!user) {
    return res.status(404).json({ message: "User NOT Found!" });
  }

  //   If the user is found then return
  return res.status(200).json({ user });
};

// Export the signup function
export { signUp, login, verifyToken, getUser };
