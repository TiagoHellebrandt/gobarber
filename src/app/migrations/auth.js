import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";
import { promisify } from "util";

export const authMiddleware = async (req, res, next) => {
  let auth = req.headers.authorization;
  if (!auth) {
    return res.status(400).json({ error: "Token not found." });
  }

  let [, token] = auth.split(" ");
  let decoded = await promisify(jwt.verify)(token, authConfig.secret);
  try {
    req.userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: "Token invalid." });
  }
  return next();
};
