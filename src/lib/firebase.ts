

// @/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
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
} from 'firebase/auth';
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
} from 'firebase/firestore';
import type { ProfileInfo, Cart } from '@/context/app-context';
import type { Order, WishlistItem, SanityProduct } from '@/types';


// Initialize Firebase on the client side
function getClientApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null; // Don't initialize on the server
  }

  if (getApps().length) {
    return getApp();
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

   // Check if all required config values are present
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
  ) {
    console.error("Firebase config is missing or invalid. Make sure all NEXT_PUBLIC_FIREBASE_ variables are set in your environment.");
    return null;
  }

  return initializeApp(firebaseConfig);
}

function getClientAuth() {
  const app = getClientApp();
  return app ? getAuth(app) : null;
}

export function getClientFirestore() {
    const app = getClientApp();
    return app ? getFirestore(app) : null;
}


export const signInWithGoogle = () => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  return signInWithPopup(auth, googleProvider);
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

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  const auth = getClientAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onFirebaseAuthStateChanged(auth, callback);
};

export const updateUserPassword = (newPassword: string) => {
  const auth = getClientAuth();
  if (!auth?.currentUser) {
    throw new Error("User not authenticated.");
  }
  return updatePassword(auth.currentUser, newPassword);
};

export const reauthenticateAndChangePassword = async (currentPassword: string, newPassword: string) => {
    const auth = getClientAuth();
    const user = auth?.currentUser;

    if (!user || !user.email) {
        throw new Error("User not authenticated or email is missing.");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
};

export const reauthenticateWithGoogle = async () => {
    const auth = getClientAuth();
    const user = auth?.currentUser;

    if (!user) {
        throw new Error("User not authenticated.");
    }
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    await reauthenticateWithPopup(user, provider);
};


export const sendPasswordReset = (email: string) => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase auth not initialized");
  return sendPasswordResetEmail(auth, email);
};

export function getFirebaseAuth() {
    return getClientAuth();
}

// Firestore user profile functions
export const getUserProfile = async (uid: string): Promise<ProfileInfo | null> => {
    const db = getClientFirestore();
    if (!db) return null;
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        return userDocSnap.data() as ProfileInfo;
    }
    return null;
};

export const createUserProfile = async (uid: string, data: ProfileInfo): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, data);
};

export const updateUserProfile = async (uid: string, data: Partial<ProfileInfo>): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
};

// Cart Functions
export const onCartSnapshot = (uid: string, callback: (cart: Cart) => void): Unsubscribe => {
    const db = getClientFirestore();
    if (!db) return () => {};
    const userDocRef = doc(db, 'users', uid);

    return onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback(data.cart || {});
        } else {
            callback({});
        }
    });
};

export const updateUserCart = async (uid: string, cart: Cart): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { cart });
};


// Wishlist Functions
export const onWishlistSnapshot = (uid: string, callback: (wishlist: WishlistItem[]) => void): Unsubscribe => {
    const db = getClientFirestore();
    if (!db) return () => {};
    const wishlistCollectionRef = collection(db, 'users', uid, 'wishlist');
    const q = query(wishlistCollectionRef);

    return onSnapshot(q, (querySnapshot) => {
        const wishlist = querySnapshot.docs.map(doc => doc.data() as WishlistItem);
        callback(wishlist);
    });
};

export const addToWishlist = async (uid: string, productId: string, productData: Omit<WishlistItem, '_id'>): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    if (!uid || !productId) {
        console.error("addToWishlist: uid or productId is missing.");
        throw new Error("User ID or Product ID is missing.");
    }
    const wishlistItemRef = doc(db, 'users', uid, 'wishlist', productId);
    await setDoc(wishlistItemRef, { ...productData, _id: productId });
};

export const removeFromWishlist = async (uid: string, productId: string): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    if (!uid || !productId) {
        console.error("removeFromWishlist: uid or productId is missing.");
        throw new Error("User ID or Product ID is missing.");
    }
    const wishlistItemRef = doc(db, 'users', uid, 'wishlist', productId);
    await deleteDoc(wishlistItemRef);
};

export const clearFirestoreWishlist = async (uid: string): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    const wishlistCollectionRef = collection(db, 'users', uid, 'wishlist');
    const snapshot = await getDocs(wishlistCollectionRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};


export const addUserOrder = async (uid: string, orderData: Omit<Order, 'id' | 'uid' | 'date' | 'customOrderId'>): Promise<string> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");
    const ordersCollectionRef = collection(db, 'users', uid, 'orders');

    // Generate the custom order ID
    const now = new Date();
    const datePart = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const customOrderId = `CS-${datePart}-${randomPart}`;
    
    const docRef = await addDoc(ordersCollectionRef, {
        ...orderData,
        customOrderId,
        uid: uid,
        id: '', // This will be updated shortly
        date: serverTimestamp()
    });

    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};


export const onUserOrdersSnapshotPaginated = (
  uid: string,
  callback: (orders: Order[], lastVisible: QueryDocumentSnapshot<DocumentData> | null) => void
): Unsubscribe => {
  const db = getClientFirestore();
  if (!db) return () => {};
  const ordersCollectionRef = collection(db, 'users', uid, 'orders');
  const q = query(
    ordersCollectionRef,
    orderBy('date', 'desc'),
    limit(5)
  );

  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString();
        return { ...data, date } as Order;
    });
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    callback(orders, lastVisible);
  });
};

export const getMoreUserOrders = async (
  uid: string,
  startAfterDoc: QueryDocumentSnapshot<DocumentData>
): Promise<{ orders: Order[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  const db = getClientFirestore();
  if (!db) return { orders: [], lastVisible: null };

  const ordersCollectionRef = collection(db, 'users', uid, 'orders');
  const q = query(
    ordersCollectionRef,
    orderBy('date', 'desc'),
    startAfter(startAfterDoc),
    limit(5)
  );

  const querySnapshot = await getDocs(q);
  const orders = querySnapshot.docs.map(doc => {
    const data = doc.data();
    const date = data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString();
    return { ...data, date } as Order;
  });
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { orders, lastVisible };
};


export const onAllOrdersSnapshot = (
  callback: (orders: Order[], lastVisible: QueryDocumentSnapshot<DocumentData> | null) => void,
  filter: Order['status'] | 'All' = 'All'
): Unsubscribe => {
  const db = getClientFirestore();
  if (!db) return () => {};

  const queryConstraints: QueryConstraint[] = [];

  if (filter !== 'All') {
    queryConstraints.push(where('status', '==', filter));
  }

  queryConstraints.push(orderBy('date', 'desc'));

  queryConstraints.push(limit(5));

  const q = query(collectionGroup(db, 'orders'), ...queryConstraints);

  return onSnapshot(q, async (querySnapshot) => {
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      const ordersWithUserDetails = await Promise.all(
          querySnapshot.docs.map(async (orderDoc) => {
              const orderData = orderDoc.data();
              const date = orderData.date?.toDate ? orderData.date.toDate().toISOString() : new Date().toISOString();
              
              const userDocRef = orderDoc.ref.parent.parent;
              if (userDocRef) {
                  const userDocSnap = await getDoc(userDocRef);
                  if (userDocSnap.exists()) {
                      const userData = userDocSnap.data() as ProfileInfo;
                      return {
                          ...orderData,
                          date,
                          id: orderDoc.id,
                          uid: userDocRef.id,
                          customerName: userData.name,
                          customerEmail: userData.email,
                          customerPhone: userData.phone,
                          address: userData.address
                      } as Order;
                  }
              }
              return { ...orderData, date, id: orderDoc.id, uid: userDocRef?.id || '' } as Order;
          })
      );
      callback(ordersWithUserDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), lastVisible);
  }, (error) => {
    console.error("Error in onAllOrdersSnapshot:", error);
  });
};


export const getMoreOrders = async (
  filter: Order['status'] | 'All',
  startAfterDoc: QueryDocumentSnapshot<DocumentData> | null
): Promise<{ orders: Order[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
    const db = getClientFirestore();
    if (!db) return { orders: [], lastVisible: null };

    const queryConstraints: QueryConstraint[] = [orderBy('date', 'desc')];
    
    if (filter !== 'All') {
        queryConstraints.push(where('status', '==', filter));
    }

    if (startAfterDoc) {
        queryConstraints.push(startAfter(startAfterDoc));
    }

    queryConstraints.push(limit(5));

    const q = query(collectionGroup(db, 'orders'), ...queryConstraints);


    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const ordersWithUserDetails = await Promise.all(
        querySnapshot.docs.map(async (orderDoc) => {
            const orderData = orderDoc.data();
            const date = orderData.date?.toDate ? orderData.date.toDate().toISOString() : new Date().toISOString();

            const userDocRef = orderDoc.ref.parent.parent;
            if (userDocRef) {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as ProfileInfo;
                    return {
                        ...orderData,
                        date,
                        id: orderDoc.id,
                        uid: userDocRef.id,
                        customerName: userData.name,
                        customerEmail: userData.email,
                        customerPhone: userData.phone,
                        address: userData.address
                    } as Order;
                }
            }
            return { ...orderData, date, id: orderDoc.id, uid: userDocRef?.id || '' } as Order;
        })
    );
    
    const sortedOrders = ordersWithUserDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { orders: sortedOrders, lastVisible };
};


export const updateOrderStatus = async (uid: string, orderId: string, newStatus: Order['status'], cancelledBy?: 'user' | 'admin'): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");

    if (!uid) {
      throw new Error("User ID is missing, cannot update order status.");
    }
    
    const orderDocRef = doc(db, 'users', uid, 'orders', orderId);
    
    const updateData: { status: Order['status'], cancelledBy?: 'user' | 'admin' | any } = { status: newStatus };

    if (newStatus === 'Order Cancelled' && cancelledBy) {
        updateData.cancelledBy = cancelledBy;
    } else if (newStatus !== 'Order Cancelled') {
        updateData.cancelledBy = deleteField();
    }

    await updateDoc(orderDocRef, updateData);
};

export const rateOrder = async (uid: string, orderId: string, rating: number, feedback: string): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");

    if (!uid) {
      throw new Error("User ID is missing, cannot rate order.");
    }

    const orderDocRef = doc(db, 'users', uid, 'orders', orderId);
    await updateDoc(orderDocRef, {
        rating: rating,
        feedback: feedback
    });
};

export const addCancellationReason = async (uid: string, orderId: string, reason: string): Promise<void> => {
    const db = getClientFirestore();
    if (!db) throw new Error("Firestore not initialized");

    if (!uid) {
        throw new Error("User ID is missing, cannot add cancellation reason.");
    }

    const orderDocRef = doc(db, 'users', uid, 'orders', orderId);
    await updateDoc(orderDocRef, {
        cancellationReason: reason,
    });
};

export const deleteUserAccount = async (password?: string): Promise<void> => {
    const auth = getClientAuth();
    const db = getClientFirestore();
    const user = auth?.currentUser;

    if (!user || !db) {
        throw new Error("User not authenticated or services not initialized.");
    }

    if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
    }

    const batch = writeBatch(db);
    const userDocRef = doc(db, 'users', user.uid);
    const ordersCollectionRef = collection(db, 'users', user.uid, 'orders');

    const ordersSnapshot = await getDocs(ordersCollectionRef);
    ordersSnapshot.forEach((orderDoc) => {
        batch.delete(orderDoc.ref);
    });

    batch.delete(userDocRef);

    await batch.commit();

    await deleteUser(user);
};


    