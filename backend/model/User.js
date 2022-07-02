import mongoose from "mongoose";

// User Schema
const Schema = mongoose.Schema;

// Creating an instance of user Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

// Export as a collection
export default mongoose.model("User", userSchema);
