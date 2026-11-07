import { getAnalytics, isSupported } from 'firebase/analytics';
import { app } from '../lib/firebase';

isSupported().then((supported) => {
	if (supported) {
		getAnalytics(app);
	}
});
