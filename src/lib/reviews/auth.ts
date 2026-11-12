/**
 * Review-facing aliases for the shared Google session. The implementation
 * lives in `src/lib/auth/google.ts` so the contact form can reuse it without a
 * dependency on the reviews feature.
 */
export {
  completeRedirectSignIn,
  signInWithGoogle,
  signOutOfGoogle,
  subscribeToAuth,
  toGoogleSessionUser as toReviewSessionUser,
  type GoogleSessionUser as ReviewSessionUser,
  type GoogleSignInResult,
} from '@/lib/auth/google'
