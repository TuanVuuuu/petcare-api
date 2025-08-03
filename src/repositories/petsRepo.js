import admin from "../firebase.js";

const db = admin.firestore();
const petsCollection = db.collection("pets");

// ✅ Thêm pet kèm theo ownerId
export async function createPet(ownerId, name, type, age) {
  const docRef = await petsCollection.add({
    name,
    type,
    age,
    ownerId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: docRef.id, name, type, age, ownerId };
}

// ✅ Lấy pets của một user cụ thể
export async function getPetsByUser(ownerId) {
  const snapshot = await petsCollection.where("ownerId", "==", ownerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ✅ Lấy pet theo ID (chỉ owner mới được xem)
export async function getPetById(ownerId, petId) {
  const petDoc = petsCollection.doc(petId);
  const doc = await petDoc.get();

  if (!doc.exists) {
    return null;
  }

  const petData = doc.data();
  if (petData.ownerId !== ownerId) {
    throw new Error("Bạn không có quyền xem pet này");
  }

  return { id: doc.id, ...petData };
}

// ✅ Update pet (chỉ owner mới được update)
export async function updatePet(ownerId, petId, updateData) {
  const petDoc = petsCollection.doc(petId);
  const doc = await petDoc.get();

  if (!doc.exists) {
    return null;
  }

  const petData = doc.data();
  if (petData.ownerId !== ownerId) {
    throw new Error("Bạn không có quyền update pet này");
  }

  const updatePayload = {
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await petDoc.update(updatePayload);
  
  // Return updated pet
  const updatedDoc = await petDoc.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

// ✅ Xóa pet (chỉ xóa nếu đúng owner)
export async function deletePet(ownerId, petId) {
  const petDoc = petsCollection.doc(petId);
  const doc = await petDoc.get();

  if (!doc.exists) {
    throw new Error("Pet không tồn tại");
  }
  if (doc.data().ownerId !== ownerId) {
    throw new Error("Bạn không có quyền xóa pet này");
  }

  await petDoc.delete();
  return { message: "Pet deleted" };
}