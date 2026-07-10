import "./globals.css";
import { ToastContainer } from "react-toastify";
import "../../node_modules/react-toastify/dist/ReactToastify.css";
import Providers from "@/store/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
