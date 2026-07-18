import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

// react-snap pre-renders pages at build time, leaving real DOM content in #root.
// If content exists, hydrate (attach React to existing HTML) instead of full render.
if (rootElement.hasChildNodes()) {
    hydrateRoot(rootElement, <React.StrictMode><App /></React.StrictMode>);
} else {
    createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}