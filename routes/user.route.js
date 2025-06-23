import express from 'express';
import passport from 'passport';
import User from '../schemas/user.schema.js';

const router = express.Router();    

router.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, email, city , Phone } = req.body;
    const user = new User({ username, email, city , Phone });
    await User.register(user, password);
    console.log(user);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});
router.post("/login", passport.authenticate("local"), (req, res) => {
  console.log(req.user.email);
  res.status(200).json({ message: "User logged in successfully" });
});
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    res.status(200).json({ message: "User logged out successfully" });
  });
});

router.get("/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
}
);

export default router;