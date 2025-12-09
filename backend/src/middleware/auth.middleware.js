import { User } from "../models/user.models.js";

import jwt from "jsonwebtoken";

export async function authUserMiddleware(req, res, next) {
  const token = req.cookies.token;
  console.log(token);
  

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    
    const user = await User.findById(decoded.id);

    console.log(user);
    

    if (!user) {
      return res.status(401).json({
        message: " Unauthorized Access. User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: " Unauthorized Access. Invalid token",
    });
  }
}
