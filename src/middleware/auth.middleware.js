import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* const response = await fetch(
  `https://635ec1c1-54b7-4fbc-b5f6-fe1048fc3b5d-00-d31bu5pb922l.pike.repl.co/api/books`,
  {
    method: "POST",
    body: JSON.stringify({
      title,
      caption,
    }),
    headers: { Authorization: `Bearer ${token}` },
  },
); */

const protectRoute = async (req, res, next) => {
  try {
    //get token
    const token = req.header("Authentication").replace("Bearer", "");

    if (!token)
      return res
        .status(401)
        .json({ message: "No authentication token, access denied " });

    // verify token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Token is not valid" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error", error);
    res.status(500).json({ message: "Token is not valid"});
  }
};

export default protectRoute;