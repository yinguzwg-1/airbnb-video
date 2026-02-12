"use client";

import { useState, useEffect } from "react";
import { MdAdd } from "react-icons/md";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/useAuthStore";
import UploadModal from "./UploadModal";
import { i18n } from "../config/i18n";

interface UploadButtonProps {
  currentLang: string;
}

export default function UploadButton({ currentLang }: UploadButtonProps) {
  const t = i18n[currentLang as "zh" | "en"] || i18n.zh;
  const { isLoggedIn } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoggedIn) return null;

  return (
    <div>
      <motion.button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-full shadow-2xl shadow-sky-500/30 flex items-center justify-center z-40 group"
        title={t.upload.title}
        initial={{ scale: 0, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.12, boxShadow: "0 20px 40px -8px rgba(56, 189, 248, 0.45)" }}
        whileTap={{ scale: 0.9 }}
      >
        <MdAdd className="w-8 h-8 transition-transform group-hover:rotate-90" />
        {/* Breathe ring */}
        <span className="absolute inset-0 rounded-full animate-breathe opacity-60 pointer-events-none" />
      </motion.button>
      <UploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} currentLang={currentLang} />
    </div>
  );
}

