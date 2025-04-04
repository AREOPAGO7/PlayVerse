import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './globals.css';
import OnlineStatus from './components/OnlineStatus'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>PlayVerse</title>
      </head>
      <body>
        <UserProvider>
          <NotificationProvider>
            <AuthProvider>
              <OnlineStatus />
              {children}
            </AuthProvider>
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}