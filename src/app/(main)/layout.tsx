import Header from "@/components/layout/Header";
import MapsProvider from "@/components/map/MapsProvider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MapsProvider>
      <Header />
      <main>
        {children}
      </main>
    </MapsProvider>
  );
}
