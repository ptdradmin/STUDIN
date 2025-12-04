// This file is designed to safely import JSON data on the server-side
// and export it for use in client components, avoiding Next.js module cache issues.
import { placeholderImages as imageArray } from './placeholder-images.json';

// We export the data directly for components to use.
export const PlaceHolderImages = imageArray;
