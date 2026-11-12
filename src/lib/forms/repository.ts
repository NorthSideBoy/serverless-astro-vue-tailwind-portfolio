import type { Firestore } from 'firebase/firestore/lite'
import type { ContactMessagePayload } from '@/data/contact'

/**
 * Contact messages live in one private collection. The browser may only
 * create a document; reads, updates and deletes are denied by Firestore rules
 * and stay available to the Admin SDK and the Console.
 */
export const CONTACT_COLLECTION = 'forms'

export async function createContactMessage(
  db: Firestore,
  message: ContactMessagePayload,
): Promise<void> {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore/lite')
  await addDoc(collection(db, CONTACT_COLLECTION), {
    ...message,
    createdAt: serverTimestamp(),
  })
}
