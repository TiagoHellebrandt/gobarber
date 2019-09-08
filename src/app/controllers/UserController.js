import User from "../models/User";
import * as Yup from "yup";

class UserController {
  async index(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(400).json({ error: "User not exist." });
    }

    return res.json(user);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails." });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: "User already exists." });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassoword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when("oldPassoword", (oldPassoword, field) =>
          oldPassoword ? field.required() : field
        ),
      confirmPassord: Yup.string().when((password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails." });
    }

    let { email, oldPassoword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: "User already exists." });
      }
    }

    if (oldPassoword && !(await user.checkPassword(oldPassoword))) {
      return res.status(401).json({ error: "Password dos not match." });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, provider });
  }
}

export default new UserController();
