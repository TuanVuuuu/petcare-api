import admin from "../firebase.js";

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token không được cung cấp" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔥 ép Firebase check xem token có bị revoke chưa
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Lỗi verify token:", error);
    // Firebase trả ra lỗi code `auth/id-token-revoked` khi token đã bị revoke
    if (error.code === "auth/id-token-revoked") {
      return res.status(401).json({ error: "Token đã bị logout (revoked)" });
    }
    res.status(401).json({ error: "Token không hợp lệ" });
  }
}