'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#111111',
          color: '#FAF7F2',
          border: '1px solid #D4B58E',
          borderRadius: '8px',
          padding: '16px',
        },
        success: {
          style: {
            background: '#111111',
            color: '#D4B58E',
            border: '1px solid #D4B58E',
          },
          iconTheme: {
            primary: '#D4B58E',
            secondary: '#111111',
          },
        },
        error: {
          style: {
            background: '#111111',
            color: '#EF4444',
            border: '1px solid #EF4444',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#111111',
          },
        },
      }}
    />
  );
}
