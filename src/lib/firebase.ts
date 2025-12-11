// @/lib/firebase.ts

// ---------- IMPORTS ----------
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp
} from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  type User
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  collectionGroup,
  where,
  writeBatch,
  serverTimestamp,
  deleteField,
  onSnapshot,
  type Unsubscribe,
  limit,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
  deleteDoc
} from "firebase/firestore";

import type { ProfileInfo, Cart } from "@/context/app-context";
import type { Order, WishlistItem } from "@/types";
import { Messaging, isSupported, getMessaging } from "firebase/messaging";



// **************************************
//      CLIENT-SAFE FIREBASE INIT
// **************************************
let firebaseApp: FirebaseApp | null = null;

export function getClientApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null; // ⛔ SSR: don't run

  if (!firebaseApp) {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };

      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return firebaseApp;
}

// **************************************
//        FIREBASE CLOUD MESSAGING
// **************************************

// Async because messaging requires browser support check
export const messaging = (async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null; // SSR-safe

  const app = getClientApp();
  if (!app) return null;

  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging not supported in this browser.");
    return null;
  }

  return getMessaging(app);
})();

// Helper function for cleaner usage in components
export async function getClientMessaging() {
  return await messaging; // resolves to Messaging | null
}

export function getClientAuth() {
  const app = getClientApp();
  return app ? getAuth(app) : null;
}

export function getClientFirestore() {
  const app = getClientApp();
  return app ? getFirestore(app) : null;
}



// **************************************
//            AUTH FUNCTIONS
// **************************************

export const signInWithGoogle = () => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
};

export const signUpWithEmail = (email: string, password: string) => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email: string, password: string) => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  return signOut(auth);
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void
): Unsubscribe => {
  const auth = getClientAuth();
  if (!auth) return () => {};
  return onFirebaseAuthStateChanged(auth, callback);
};

export const updateUserPassword = (newPassword: string) => {
  const auth = getClientAuth();
  if (!auth?.currentUser) throw new Error("User not authenticated.");
  return updatePassword(auth.currentUser, newPassword);
};

export const reauthenticateAndChangePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const auth = getClientAuth();
  const user = auth?.currentUser;
  if (!user || !user.email) throw new Error("User not authenticated.");
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
};

export const reauthenticateWithGoogle = async () => {
  const auth = getClientAuth();
  const user = auth?.currentUser;
  if (!user) throw new Error("User not authenticated.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return reauthenticateWithPopup(user, provider);
};

export const sendPasswordReset = (email: string) => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  return sendPasswordResetEmail(auth, email);
};

export function getFirebaseAuth() {
  return getClientAuth();
}



// **************************************
//         USER PROFILE FIRESTORE
// **************************************

export const getUserProfile = async (
  uid: string
): Promise<ProfileInfo | null> => {
  const db = getClientFirestore();
  if (!db) return null;

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as ProfileInfo) : null;
};

export const createUserProfile = async (uid: string, data: ProfileInfo) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");
  return setDoc(doc(db, "users", uid), data);
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<ProfileInfo>
) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");
  return updateDoc(doc(db, "users", uid), data);
};



// **************************************
//             CART
// **************************************

export const onCartSnapshot = (
  uid: string,
  callback: (cart: Cart) => void
): Unsubscribe => {
  const db = getClientFirestore();
  if (!db) return () => {};
  return onSnapshot(doc(db, "users", uid), (snap) => {
    callback(snap.exists() ? snap.data().cart || {} : {});
  });
};

export const updateUserCart = async (uid: string, cart: Cart) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");
  return updateDoc(doc(db, "users", uid), { cart });
};



// **************************************
//              WISHLIST
// **************************************

export const onWishlistSnapshot = (
  uid: string,
  callback: (wishlist: WishlistItem[]) => void
): Unsubscribe => {
  const db = getClientFirestore();
  if (!db) return () => {};
  const colRef = collection(db, "users", uid, "wishlist");
  return onSnapshot(colRef, (snap) =>
    callback(snap.docs.map((d) => d.data() as WishlistItem))
  );
};

export const addToWishlist = async (
  uid: string,
  productId: string,
  data: Omit<WishlistItem, "_id">
) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");
  return setDoc(doc(db, "users", uid, "wishlist", productId), {
    ...data,
    _id: productId
  });
};

export const removeFromWishlist = async (uid: string, productId: string) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");
  return deleteDoc(doc(db, "users", uid, "wishlist", productId));
};

export const clearFirestoreWishlist = async (uid: string) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");

  const colRef = collection(db, "users", uid, "wishlist");
  const snap = await getDocs(colRef);
  const batch = writeBatch(db);
  snap.forEach((d) => batch.delete(d.ref));
  return batch.commit();
};



// **************************************
//                ORDERS
// **************************************

export const addUserOrder = async (
  uid: string,
  orderData: Omit<Order, "id" | "uid" | "date" | "customOrderId">
) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");

  // create custom order ID
  const now = new Date();
  const datePart = `${now.getFullYear().toString().slice(-2)}${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }

  const customOrderId = `CS-${datePart}-${randomPart}`;

  const colRef = collection(db, "users", uid, "orders");

  const docRef = await addDoc(colRef, {
    ...orderData,
    uid,
    customOrderId,
    id: "",
    date: serverTimestamp()
  });

  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const onUserOrdersSnapshotPaginated = (
  uid: string,
  callback: (
    orders: Order[],
    lastVisible: QueryDocumentSnapshot<DocumentData> | null
  ) => void
): Unsubscribe => {
  const db = getClientFirestore();
  if (!db) return () => {};

  const q = query(
    collection(db, "users", uid, "orders"),
    orderBy("date", "desc"),
    limit(5)
  );

  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => {
      const data = d.data();
      const date = data.date?.toDate
        ? data.date.toDate().toISOString()
        : new Date().toISOString();
      return { ...data, date } as Order;
    });

    callback(orders, snap.docs[snap.docs.length - 1] || null);
  });
};

export const getMoreUserOrders = async (
  uid: string,
  startAfterDoc: QueryDocumentSnapshot<DocumentData>
) => {
  const db = getClientFirestore();
  if (!db) return { orders: [], lastVisible: null };

  const q = query(
    collection(db, "users", uid, "orders"),
    orderBy("date", "desc"),
    startAfter(startAfterDoc),
    limit(5)
  );

  const snap = await getDocs(q);

  const orders = snap.docs.map((d) => {
    const data = d.data();
    const date = data.date?.toDate
      ? data.date.toDate().toISOString()
      : new Date().toISOString();
    return { ...data, date } as Order;
  });

  return {
    orders,
    lastVisible: snap.docs[snap.docs.length - 1] || null
  };
};

export const onAllOrdersSnapshot = (
  callback: (
    orders: Order[],
    lastVisible: QueryDocumentSnapshot<DocumentData> | null
  ) => void,
  filter: Order["status"] | "All" = "All"
): Unsubscribe => {
  const db = getClientFirestore();
  if (!db) return () => {};

  const constraints: QueryConstraint[] = [];

  if (filter !== "All") constraints.push(where("status", "==", filter));

  constraints.push(orderBy("date", "desc"));
  constraints.push(limit(5));

  const q = query(collectionGroup(db, "orders"), ...constraints);

  return onSnapshot(
    q,
    async (snap) => {
      const last = snap.docs[snap.docs.length - 1] || null;

      const orders = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const date = data.date?.toDate
            ? data.date.toDate().toISOString()
            : new Date().toISOString();

          const userDoc = d.ref.parent.parent;
          if (!userDoc) return data as Order;

          const userSnap = await getDoc(userDoc);
          const user = userSnap.exists()
            ? (userSnap.data() as ProfileInfo)
            : null;

          return {
            ...data,
            date,
            id: d.id,
            uid: userDoc.id,
            customerName: user?.name,
            customerEmail: user?.email,
            customerPhone: user?.phone,
            address: user?.address
          } as Order;
        })
      );

      callback(
        orders.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        last
      );
    },
    (err) => console.error("Error in onAllOrdersSnapshot:", err)
  );
};

export const getMoreOrders = async (
  filter: Order["status"] | "All",
  startAfterDoc: QueryDocumentSnapshot<DocumentData> | null
) => {
  const db = getClientFirestore();
  if (!db) return { orders: [], lastVisible: null };

  const constraints: QueryConstraint[] = [orderBy("date", "desc")];

  if (filter !== "All") constraints.push(where("status", "==", filter));

  if (startAfterDoc) constraints.push(startAfter(startAfterDoc));

  constraints.push(limit(5));

  const q = query(collectionGroup(db, "orders"), ...constraints);
  const snap = await getDocs(q);

  const orders = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      const date = data.date?.toDate
        ? data.date.toDate().toISOString()
        : new Date().toISOString();

      const userRef = d.ref.parent.parent;
      const userSnap = userRef ? await getDoc(userRef) : null;
      const user = userSnap?.exists() ? (userSnap.data() as ProfileInfo) : null;

      return {
        ...data,
        date,
        id: d.id,
        uid: userRef?.id,
        customerName: user?.name,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        address: user?.address
      } as Order;
    })
  );

  return {
    orders: orders.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    lastVisible: snap.docs[snap.docs.length - 1] || null
  };
};

export const updateOrderStatus = async (
  uid: string,
  orderId: string,
  newStatus: Order["status"],
  cancelledBy?: "user" | "admin"
) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");

  const ref = doc(db, "users", uid, "orders", orderId);

  const updateData: any = { status: newStatus };

  if (newStatus === "Order Cancelled" && cancelledBy)
    updateData.cancelledBy = cancelledBy;
  else if (newStatus !== "Order Cancelled")
    updateData.cancelledBy = deleteField();

  return updateDoc(ref, updateData);
};

export const rateOrder = async (
  uid: string,
  orderId: string,
  rating: number,
  feedback: string
) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");

  return updateDoc(doc(db, "users", uid, "orders", orderId), {
    rating,
    feedback
  });
};

export const addCancellationReason = async (
  uid: string,
  orderId: string,
  reason: string
) => {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not initialized");

  return updateDoc(doc(db, "users", uid, "orders", orderId), {
    cancellationReason: reason
  });
};



// **************************************
//           DELETE USER ACCOUNT
// **************************************

export const deleteUserAccount = async (password?: string) => {
  const auth = getClientAuth();
  const db = getClientFirestore();
  const user = auth?.currentUser;

  if (!user || !db)
    throw new Error("User not authenticated or Firestore not ready.");

  if (password && user.email) {
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);
  }

  const batch = writeBatch(db);

  // Delete orders
  const ordersSnap = await getDocs(collection(db, "users", user.uid, "orders"));
  ordersSnap.forEach((d) => batch.delete(d.ref));

  // Delete user doc
  batch.delete(doc(db, "users", user.uid));

  await batch.commit();

  // Delete Firebase Auth account
  await deleteUser(user);
};

