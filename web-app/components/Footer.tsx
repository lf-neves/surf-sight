"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-cyan-600 transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/spots"
              className="text-sm text-gray-600 hover:text-cyan-600 transition-colors"
            >
              Picos
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-cyan-600 transition-colors"
            >
              Termos
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-cyan-600 transition-colors"
            >
              Privacidade
            </Link>
          </nav>

          {/* Data Sources */}
          <div className="text-sm text-gray-500">
            Fontes de dados: <span className="text-gray-700">NOAA</span> •{" "}
            <span className="text-gray-700">Stormglass</span> •{" "}
            <span className="text-gray-700">Windy</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6">
          <Separator className="mb-6" />
          <p className="text-center text-xs text-gray-500">
            © 2025 SurfSight. Ajudando surfistas a ler o mar com confiança.
          </p>
        </div>
      </div>
    </footer>
  );
}
