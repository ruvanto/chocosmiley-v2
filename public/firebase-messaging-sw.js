importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyD08lAfDCKjaV4-TqkdUq12GLaep0eQsfk",
    authDomain: "choco-smiley.firebaseapp.com",
    projectId: "choco-smiley",
    storageBucket: "choco-smiley.firebasestorage.app",
    messagingSenderId: "358935174899",
    appId: "1:358935174899:web:d641fb3717a595a2a72186"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
