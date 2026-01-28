const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username, password });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, isLoggedIn: true });
};
