import { initializeApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: 'AIzaSyBYuMKK8OMsJnC60C9nVO42prvucWxD6Os',
	authDomain: 'northsideboy-portfolio.firebaseapp.com',
	projectId: 'northsideboy-portfolio',
	storageBucket: 'northsideboy-portfolio.firebasestorage.app',
	messagingSenderId: '196567665734',
	appId: '1:196567665734:web:259def7d225ac210a3ce47',
	measurementId: 'G-8GPH1K3S80',
};

export const app = initializeApp(firebaseConfig);
