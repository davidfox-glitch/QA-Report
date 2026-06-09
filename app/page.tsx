import { redirect } from 'next/navigation';

export default function Home() {
  // If the user visits the Next.js server directly, redirect them to the Vite frontend
  // Since we don't know the exact IP/port on the server, we can output a helpful message.
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Next.js API Backend is Running</h1>
      <p>This port (3000) is only used for the API backend.</p>
      <p><strong>Please open the Vite frontend app (usually port 5173) in your browser.</strong></p>
      <p>Also, please restart your terminal so the new `npm run dev` script can start both Vite and Next.js.</p>
    </div>
  );
}
