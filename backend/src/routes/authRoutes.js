const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/authController");
const validate = require("../validators/validate");
const { registerSchema } = require("../validators/schemas");

// Defense-in-depth against credential brute-forcing, independent of any
// rate limiting the Nginx gateway also applies in front of the API.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many login attempts. Try again later." },
});

// Separate, slightly looser limiter for registration so it isn't affected
// by (or doesn't affect) login brute-force protection.
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many registration attempts. Try again later." },
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Create a new user account and obtain a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: jane_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: aStrongPassword123
 *     responses:
 *       201:
 *         description: Account created, JWT issued
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username or email already taken
 *       429:
 *         description: Too many registration attempts
 */
router.post("/register", registerLimiter, validate(registerSchema), controller.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in and obtain a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 format: password
 *                 example: yourpassword
 *     responses:
 *       200:
 *         description: Login succeeded, JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 tokenType:
 *                   type: string
 *                   example: Bearer
 *                 expiresIn:
 *                   type: string
 *                   example: 1h
 *       400:
 *         description: username or password missing
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
router.post("/login", loginLimiter, controller.login);

module.exports = router;
