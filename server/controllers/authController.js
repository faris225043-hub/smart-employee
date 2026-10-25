import User from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      employee: req.user.employee,
    },
  });
};

export const createUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role, employeeId } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A user with email '${email}' already exists.`,
      });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Employee',
      employee: employeeId || null,
    });

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
