"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto",
        className
      )}
    >
      {children}
    </motion.main>
  );
}
