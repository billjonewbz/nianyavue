import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "无人碾压数字孪生系统",
  description: "无人碾压数字孪生系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
