import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = express.Router();

// Login: block IP after 100 failed attempts in 15 minutes (increased for testing)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register: max 50 accounts per IP per hour (increased for testing)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { error: 'Too many accounts created from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validation Helpers ───────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter.';
  return null; // valid
}

// ─── Register ─────────────────────────────────────────────────────────────────

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate password strength
    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      plan: 'free'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
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
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check account lockout
    if (user.isLocked()) {
      const remainingMs = user.lockUntil!.getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);
      return res.status(403).json({
        error: `Account is locked due to too many failed attempts. Try again in ${remainingMins} minute(s).`
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Increment failed attempts
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const update: Record<string, unknown> = { failedLoginAttempts: attempts };

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        update.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }

      await User.findByIdAndUpdate(user._id, update);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login — reset lockout counters
    await User.findByIdAndUpdate(user._id, {
      failedLoginAttempts: 0,
      lockUntil: null
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
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
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Get current user ─────────────────────────────────────────────────────────

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      plan: user.plan,
      stats: user.stats
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ─── Update plan ──────────────────────────────────────────────────────────────

router.patch('/plan', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;

    await User.findByIdAndUpdate(req.userId, { plan });

    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

export default router;
