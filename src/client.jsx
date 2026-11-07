import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/cairo';
import './styles.css';
import { App, getRoute } from './site.jsx';

const root = document.getElementById('root');
const app = <App route={getRoute(window.location.pathname)} />;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
