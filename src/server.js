import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { Strategy } from 'passport-local';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; 
import User from '../schemas/user.schema.js';
import userRoutes from '../routes/user.route.js';
import contactRoutes from '../routes/contact.routes.js';
import paymentRoutes from '../routes/payment.routes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ 
  origin: "http://localhost:3000", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      return done(null, profile);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.use(new Strategy(User.authenticate()));
passport.serializeUser((user, done) => {
  if (user.emails) {
    done(null, { type: 'google', email: user.emails[0].value });
  } else {
    done(null, { type: 'local', id: user._id });
  }
});

passport.deserializeUser(async (serializedUser, done) => {
  try {
    let user;
    if (serializedUser.type === 'google') {
      user = await User.findOne({ email: serializedUser.email });
    } else {
      user = await User.findById(serializedUser.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log("Database connection error:", err));

app.use('/api', userRoutes);
app.use('/api', contactRoutes);
app.use('/api', paymentRoutes);

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(indexPath);
    });
  }
}
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});