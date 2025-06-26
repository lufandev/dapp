import type { Metadata } from "next";
import "./globals.css";
import LocaleProvider from "@/components/LocaleProvider";
import ThemeProvider from "@/components/ThemeProvider";
import FeedbackProvider from "@/components/ui/Feedback";

export const metadata: Metadata = {
  title: "QF-NFT | 数字藏品交易平台",
  description: "一个类似网易BUFF的NFT交易平台，提供数字藏品的买卖和租赁服务",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <FeedbackProvider>
              {children}
            </FeedbackProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
