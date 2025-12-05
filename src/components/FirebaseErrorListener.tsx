'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from './ui/button';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (permissionError: FirestorePermissionError) => {
      console.error('Contextual Firestore Permission Error:', permissionError.message);
      setError(permissionError);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-2xl w-full">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Firestore Security Rule Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            The following request was denied by your security rules. Check the details below to identify the issue in your `firestore.rules` file.
          </p>
          <pre className="bg-background/50 p-3 rounded-md text-xs overflow-auto">
            <code>
              {JSON.stringify(error.request, null, 2)}
            </code>
          </pre>
           <div className="mt-4 flex justify-end">
            <Button onClick={() => setError(null)}>Close</Button>
        </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
