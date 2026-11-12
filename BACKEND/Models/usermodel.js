import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: "",
    },
    height: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    profilePic: {
      type: String,
      default: "",
    },
    preferences: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
