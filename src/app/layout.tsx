import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "LangSavor - 프랑스어 기사 기반 학습",
  description: "기사 속 언어를 음미하며 프랑스어를 마스터하세요. DELF/DALF 시험 준비를 위한 급수별 맞춤 학습 서비스.",
  keywords: ["프랑스어", "DELF", "DALF", "언어학습", "기사", "어휘"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ colorScheme: 'light' }}>
      <body className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#3D3228]">
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
