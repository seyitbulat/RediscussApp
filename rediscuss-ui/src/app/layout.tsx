import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from 'next/font/google'
import { ThemeProvider } from "@mui/material";
import theme from '../theme'
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body style={{margin: 0}}>
        <ReactQueryProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
