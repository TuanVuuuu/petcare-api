import admin from "../firebase.js";

const db = admin.firestore();
const usersCollection = db.collection("users");

export async function createUserProfile(uid, email) {
  await usersCollection.doc(uid).set({
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function getUserProfile(uid) {
  const doc = await usersCollection.doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function deleteUserProfile(uid) {
  await usersCollection.doc(uid).delete();
}