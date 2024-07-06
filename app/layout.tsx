import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import {
  LoginModal,
  ClientOnly,
  Modal,
  Navbar,
  RegisterModal,
} from "./components";
import ToasterProvider from "./providers/ToasterProvider";

const inter = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airbnb",
  description: "Airbnb clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <ToasterProvider />
          <RegisterModal />
          <LoginModal />
          <Navbar />
        </ClientOnly>
        {children}
      </body>
    </html>
  );
}
