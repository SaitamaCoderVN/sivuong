'use client';

import Link from "next/link";
import { Trophy, Home, User, BookOpen, Target, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusMode } from "@/lib/contexts/FocusModeContext";

import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Navbar() {
  const pathname = usePathname();
  const { isFocusMode } = useFocusMode();

  const navItems = [
    { label: "Rituals", href: "/", icon: Home },
    { label: "Legacy", href: "/achievements", icon: Trophy },
  ];

  return (
    <AnimatePresence>
      {!isFocusMode && (
          <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300"
          >
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
              <Link href="/" className="transition-all active:scale-95">
                <h1 className="text-xl font-semibold tracking-tight">
                  Sĩ Vương
                </h1>
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border mr-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all relative overflow-hidden group/item",
                          isActive 
                            ? "bg-background text-primary shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "relative z-10 flex items-center gap-2"
                        )}>
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline-block tracking-tight">{item.label}</span>
                        </div>
                        {isActive && (
                          <motion.div 
                            layoutId="navbar-active"
                            className="absolute inset-0 bg-background"
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </motion.header>
      )}
    </AnimatePresence>
  );
}
