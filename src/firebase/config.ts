
import { FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAc8X2IT14tHo80hkg7IzY00jRH4PuB2o4",
  authDomain: "studio-4385357604-24c83.firebaseapp.com",
  projectId: "studio-4385357604-24c83",
  storageBucket: "studio-4385357604-24c83.appspot.com",
  messagingSenderId: "1039469624980",
  appId: "1:1039469624980:web:f6c7426a7c7e931406fe81"
};


export function getFirebaseConfig() {
  if (!firebaseConfig.apiKey) {
     // This error can happen on the server side, where env vars might not be available.
     // The app will function correctly on the client side where they are available.
     // We will not throw an error here to avoid crashing the server build.
  }
  return firebaseConfig;
}
