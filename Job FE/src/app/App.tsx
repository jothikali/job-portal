import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from './routes';
import { InstallBottomBanner } from './components/InstallBanner';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: { fontWeight: 700, fontSize: '13px', borderRadius: '14px' },
        }}
      />
      <RouterProvider router={router} />
      {/* PWA install nudge — appears once on mobile when app is installable */}
      <InstallBottomBanner />
    </>
  );
}
