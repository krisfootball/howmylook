import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

export function getFirebaseMessaging() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: normalizePrivateKey(privateKey),
        }),
      });
    } else {
      initializeApp({
        credential: applicationDefault(),
      });
    }
  }

  return getMessaging();
}
