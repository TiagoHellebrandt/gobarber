import User from "../models/User";

import auth from "../../config/auth";

import jwt from "jsonwebtoken";
import * as Yup from "yup";

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails." });
    }

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
