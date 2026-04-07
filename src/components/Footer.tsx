"use client";
import Image from "next/image";
import { Shirt } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 border-t border-celeste/20 mx-auto  bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shirt width={'32'} height={'32'}/>
            <span className="font-semibold text-foreground">
              Gestion{" "}<span className="text-primary">OK</span>
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Gestion OK.{" "} Sistema de gestión de stock.{" "}{new Date().getFullYear()} 
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
