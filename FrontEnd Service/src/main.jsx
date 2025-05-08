import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { InscriptionProvider } from './context/InscriptionContext';
import AppLayout from './App';
import './index.css'; 


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <InscriptionProvider>
            <AppLayout />
          </InscriptionProvider>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
