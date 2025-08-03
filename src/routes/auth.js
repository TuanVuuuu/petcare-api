import express from "express";
import * as authService from "../services/authService.js";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/verifyToken.js";

dotenv.config();

const router = express.Router();

// Validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  req.body.email = email.toLowerCase().trim();
  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  next();
};

// ✅ Login route
router.post("/login", validateEmail, async (req, res) => {
    try {
        const { email } = req.body;
        const customToken = await authService.login(email);
        res.json({ 
            message: "Login thành công", 
            customToken 
        });
    } catch (error) {
        console.error("❌ Lỗi login:", error);
        if (error.message.includes("User chưa tồn tại")) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// exchange token
router.post("/exchange", async (req, res) => {
    console.log("📥 Body nhận được:", req.body);
    const { customToken } = req.body;

    if (!customToken) {
        return res.status(400).json({ error: "Custom token is required" });
    }

    try {
        // Dùng Firebase REST API để đổi custom token -> ID token
        const API_KEY = process.env.FIREBASE_API_KEY;

        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: customToken,
                    returnSecureToken: true,
                }),
            }
        )

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(400).json({ 
                error: "Invalid custom token",
                details: data.error?.message || "Token exchange failed"
            });
        }
        
        res.json({ message: "Token đã đổi thành công", data: data });
    } catch (error) {
        console.error("❌ Lỗi exchange token:", error);
        res.status(500).json({ error: error.message });
    }
})

// ✅ Logout (revoke token)
router.post("/logout", async (req, res) => {
    try {
        const idToken = req.headers.authorization?.split(" ")[1];
        if (!idToken) return res.status(400).json({ error: "Thiếu token" });

        await authService.logout(idToken);
        res.json({ message: "User đã logout (token bị revoke)" });
    } catch (error) {
        console.error("❌ Lỗi logout:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Lấy thông tin user (đã verify token trong middleware)
router.get("/me", verifyToken, (req, res) => {
    res.json({
        message: "User profile retrieved successfully",
        user: req.user
    });
});

// ✅ Signup route
router.post("/signup", validateEmail, validatePassword, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const newUser = await authService.signup(email, password, name);
        res.status(201).json({ 
            message: "Signup thành công", 
            customToken: newUser.customToken 
        });
    } catch (error) {
        console.error("❌ Lỗi signup:", error);

        if (error.message.includes("Email đã tồn tại")) {
            return res.status(409).json({ error: error.message });
        }

        return res.status(500).json({ error: "Lỗi server khi signup" });
    }
});

// 📄 routes/auth.js
router.delete("/delete", validateEmail, async (req, res) => {
    try {
        const { email } = req.body;

        await authService.deleteUser(email);

        res.json({ message: `✅ User ${email} đã bị xóa` });
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            return res.status(404).json({ message: "ℹ️ User không tồn tại" });
        }
        console.error("❌ Lỗi xóa user:", error);
        res.status(500).json({ error: "Lỗi server khi xóa user" });
    }
});

export default router;
