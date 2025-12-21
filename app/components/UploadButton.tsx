"use client";

import { useState, useEffect } from "react";
import { MdAdd } from "react-icons/md";
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

  // 确保在客户端渲染以读取 zustand persist 数据
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoggedIn) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-40 group"
        title={t.upload.title}
      >
        <MdAdd className="w-8 h-8 transition-transform group-hover:rotate-90" />
      </button>

      <UploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} currentLang={currentLang} />
    </>
  );
}

