const HttpError = require("../models/http-error");
const { v4: uuid } = require("uuid");

let SEED_USERS = [
  {
    id: "u1",
    name: "John Doe",
    email: "test@test.com",
    password: "test",
  },
];

exports.getUsers = (req, res, next) => {
  res.json({ users: SEED_USERS });
};

exports.signup = (req, res, next) => {
  const { name, email, password } = req.body;
  const userIndex = SEED_USERS.findIndex((u) => u.email === email);

  if (userIndex >= 0) {
    next(
      new HttpError(
        "The entered email is already in use. Try again, or recover your password.",
        500
      )
    );
  } else {
    const newUser = { id: uuid(), name, email, password };
    SEED_USERS.push(newUser);
    res.status(201).json(newUser);
  }
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const user = SEED_USERS.find((u) => u.email === email);

  if (!user) {
    next(
      new HttpError(
        "The entered email and password combination is not valid.",
        401
      )
    );
  } else {
    if (password === user.password) {
      res.json({ message: "Logged in as " + user.name });
    } else {
      next(new HttpError("The entered password is incorrect.", 401));
    }
  }
};
