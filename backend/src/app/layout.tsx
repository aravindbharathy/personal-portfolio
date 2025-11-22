import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio API',
  description: 'Backend API for portfolio website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
