import rateLimit from "express-rate-limit";


export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 20),
  message: {
    message: "Too many login attempts from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX ?? 15),
  message: {
    message: "Too many accounts created from this IP. Try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
