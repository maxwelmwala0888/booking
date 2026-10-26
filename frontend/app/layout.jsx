import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = { title: "Capital Suit Lodge", description: "Experience Luxury" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}