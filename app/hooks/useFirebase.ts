'use client';

import { useState, useEffect, useRef } from 'react';
import {
  auth,
  onAuthStateChanged,
  onSnapshot,
  type User,
} from '@/lib/firebase';
import type { Query, QuerySnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

/**
 * Custom useAuthState hook — replaces react-firebase-hooks/auth.
 * Listens to Firebase Auth state changes.
 */
export function useAuthState(authInstance: Auth): [User | null | undefined, boolean, Error | undefined] {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      authInstance,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [authInstance]);

  return [user, loading, error];
}

/**
 * Custom useCollection hook — replaces react-firebase-hooks/firestore.
 * Subscribes to a Firestore query via onSnapshot.
 */
export function useCollection<T = DocumentData>(
  queryRef: Query<T> | undefined | null
): [QuerySnapshot<T> | undefined, boolean, FirestoreError | undefined] {
  const [snapshot, setSnapshot] = useState<QuerySnapshot<T> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | undefined>(undefined);

  // Serialize query reference to detect actual changes
  const queryPath = queryRef ? JSON.stringify((queryRef as any)._query || 'q') : null;

  useEffect(() => {
    if (!queryRef) {
      setSnapshot(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      queryRef as any,
      (snap: QuerySnapshot<T>) => {
        setSnapshot(snap);
        setLoading(false);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPath]);

  return [snapshot, loading, error];
}
