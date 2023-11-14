import './globals.css';

export const metadata = {
  title: 'Krmx - Best Practices',
  description: 'Showcase of best practices when using Krmx with React',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
