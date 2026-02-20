import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ─── Rate Limiters ───────────────────────────────────────────────────────────

// Login: max 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register: max 3 accounts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many accounts created from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return null; // valid
}

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// ─── Register ────────────────────────────────────────────────────────────────

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Email format validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // 2. Password strength validation
    const passwordError = validatePassword(password || '');
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // 4. Hash password (bcrypt, 12 rounds for stronger security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user
    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      plan: 'free'
    });

    await user.save();

    // 6. Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Find user (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2. Check account lockout
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil!.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        error: `Account is temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
      });
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await user.save();
        return res.status(423).json({
          error: `Too many failed attempts. Your account has been locked for 15 minutes.`
        });
      }

      const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      await user.save();
      return res.status(401).json({
        error: `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`
      });
    }

    // 4. Successful login — reset lockout counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // 5. Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Get current user ────────────────────────────────────────────────────────

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      id: user._id,
      email: user.email,
      plan: user.plan,
      stats: user.stats
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user.' });
  }
});

// ─── Update plan ─────────────────────────────────────────────────────────────

router.patch('/plan', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const allowedPlans = ['free', 'pro', 'pro_plus'];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    await User.findByIdAndUpdate(req.userId, { plan });
    res.json({ message: 'Plan updated successfully.' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan.' });
  }
});

export default router;
