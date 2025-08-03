import admin from "../firebase.js";
import * as authRepo from "../repositories/authRepo.js";

export async function login(email) {
  try {
    // 🔍 Lấy user theo email
    const userRecord = await admin.auth().getUserByEmail(email);

    // 🔥 Tạo custom token cho client
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return { uid: userRecord.uid, customToken };
  } catch (err) {
    // ❌ Nếu user không tồn tại => báo lỗi
    if (err.code === "auth/user-not-found") {
      throw new Error("User chưa tồn tại, vui lòng signup trước");
    }
    throw err;
  }
}

export async function logout(idToken) {
  // ✅ verify idToken để lấy uid
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  // ✅ revoke refresh tokens
  await admin.auth().revokeRefreshTokens(decodedToken.uid);

  return { message: "User đã logout (token bị revoke)" };
}

export async function getUser(uid) {
  return await authRepo.getUserProfile(uid);
}

export async function signup(email, password, name) {
  try {
    // 🔍 Check email có tồn tại không
    let existingUser;
    try {
      existingUser = await admin.auth().getUserByEmail(email);
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        // ❗ Lỗi khác (Firebase down, network...) → throw tiếp
        throw err;
      }
    }

    if (existingUser) {
      // 🚨 Nếu user đã tồn tại thì báo lỗi rõ ràng
      throw new Error("Email đã tồn tại, vui lòng login thay vì signup");
    }

    // ✅ Tạo user Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name || email.split("@")[0],
    });

    console.log("✅ User mới:", userRecord.uid);

    // ✅ Tạo profile Firestore
    await authRepo.createUserProfile(userRecord.uid, email);

    // 🔥 Tạo custom token để app auto login sau signup
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return { uid: userRecord.uid, customToken };
  } catch (error) {
    console.error("❌ Lỗi signup:", error);
    throw error; // 👉 Không wrap Error thêm 1 lần, để giữ nguyên stack trace và code
  }
}

export async function deleteUser(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    await authRepo.deleteUserProfile(user.uid);
  } catch (error) {
    console.error("❌ Lỗi xóa user:", error);
    throw error;
  }
}