
'use client';

// This file is now primarily for re-exporting hooks and types.
// The initialization logic has been moved to client-provider.tsx to ensure it only runs on the client.

export * from './provider';
export * from './auth/use-user';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
