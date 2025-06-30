import express from 'express';
import passport from 'passport';
import User from '../schemas/user.schema.js';

const router = express.Router();    

router.post("/signup", async (req, res) => {
  try {
    const { password, email, city, phone } = req.body; 
    
    const user = new User({
      username: email, 
      email: email,
      city: city,
      Phone: phone
    });
 
    const registeredUser = await User.register(user, password);
    
    req.login(registeredUser, (err) => {
      if (err) {
        console.error("Error logging in after signup:", err);
        return res.status(500).json({ error: "User registered but login failed" });
      }
      
      res.status(201).json({ 
        message: "User registered and logged in successfully",
        user: {
          id: registeredUser._id,
          email: registeredUser.email,
          city: registeredUser.city,
          phone: registeredUser.phone
        }
      });
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message || "Error registering user" });
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json({ 
    message: "User logged in successfully",
    user: {
      id: req.user._id,
      email: req.user.email,
      city: req.user.city,
      phone: req.user.phone
    }
  });
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    console.log("User logged out successfully");
    res.status(200).json({ message: "User logged out successfully" });
  });
});

router.get("/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ 
      user: {
        id: req.user._id,
        email: req.user.email,
        city: req.user.city,
        phone: req.user.phone
      }
    });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
});


router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));


router.get(
  "/auth/google/callback",
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:8080' 
  }),
  async (req, res) => {
    try {
      const googleProfile = req.user;
      const username = googleProfile.displayName;
      const email = googleProfile.emails[0].value;

      let user = await User.findOne({ email });
      if (!user) {  
        user = new User({
          username,
          email,
          cart: [], 
        });
        await user.save();
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.redirect('http://localhost:8080');
        }
        res.redirect('http://localhost:8080/enroll');
      });
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect('http://localhost:8080');
    }
  }
);

export default router;