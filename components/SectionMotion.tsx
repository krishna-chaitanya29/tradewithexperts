"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SectionMotionProps = {
  children: ReactNode;
} & Omit<HTMLMotionProps<"section">, "children">;

export function SectionMotion({ children, className = "", ...rest }: SectionMotionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
