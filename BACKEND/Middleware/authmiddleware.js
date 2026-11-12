import jwt from "jsonwebtoken";
import User from "../Models/usermodel.js";

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Bearer token bhi allow karega
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    const secret =
      process.env.JWT_SECRET || "fit_track_secret_key_2026";

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;
    req.user.id = user._id.toString();

    next();

  } catch (error) {
    res.status(401).json({
      message: "Session expired. Please login again."
    });
  }
};

export default protect;