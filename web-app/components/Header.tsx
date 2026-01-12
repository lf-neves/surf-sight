'use client';

import { Waves, Bell, Settings, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";

export function Header() {
  const { currentUser, isAuthenticated, logout } = useCurrentUser();
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              SurfSight
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/spots"
              className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Picos
            </Link>
            <Link
              href="/forecast"
              className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Previsão
            </Link>
            <Link
              href="/alerts"
              className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Alertas
            </Link>
            <Link
              href="/sessions"
              className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Minhas Sessões
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Settings">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="bg-gradient-to-br from-cyan-400 to-blue-500 hover:shadow-lg transition-shadow"
                  aria-label="User profile"
                  title={currentUser?.email || 'User'}
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-br from-cyan-400 to-blue-500 hover:shadow-lg transition-shadow"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
