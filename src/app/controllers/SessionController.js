import User from "../models/User";

import auth from "../../config/auth";

import jwt from "jsonwebtoken";

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: "User not authorized." });
    }

    const { id, name } = user;
    const { secret, expiresIn } = auth;

    return res.json({
      user: {
        id,
        name,
        email
      },
      token: jwt.sign({ id }, secret, {
        expiresIn
      })
    });
  }
}

export default new SessionController();
