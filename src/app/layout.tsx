import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ResumeProvider } from '@/context/ResumeContext';
import { CareerProvider } from '@/context/CareerContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { UserProvider } from '@/components/user/UserContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Resume AI | Turn Your Resume Into Your Next Opportunity',
  description:
    'AI-powered resume intelligence for analyzing, improving, building, verifying and matching your career profile.',
  keywords: [
    'Smart Resume AI',
    'Resume Analyzer',
    'ATS Checker',
    'Resume Builder',
    'Skill Verification',
    'Job Match',
    'Career Intelligence',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          id="smart-resume-theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('smart_resume_theme')||localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';var m=t==='light'||t==='dark'?t:(t==='system'?d:'dark');var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(m);r.setAttribute('data-theme',m);r.style.colorScheme=m;}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans transition-colors duration-250">
        <ThemeProvider>
          <ResumeProvider>
            <CareerProvider>
              <UserProvider>
                <div className="flex w-full min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 w-full">{children}</main>
                  </div>
                </div>
              </UserProvider>
            </CareerProvider>
          </ResumeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
