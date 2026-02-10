"use client";

import { useState } from "react";
import { MdClose } from "react-icons/md";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { i18n } from "../config/i18n";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (data: any) => void;
  currentLang: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess,
  currentLang
}: AuthModalProps) {
  const t = i18n[currentLang as "zh" | "en"] || i18n.zh;

  const handleAuthSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    console.log(email, password, 'email, password');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    
    if (response.ok) {
      onAuthSuccess(data);
    } else {
      alert(data.message || t.auth.loginFailed);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <MdClose className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold">{t.auth.login}</h3>
              <div className="w-8" />
            </div>

            {/* 内容 */}
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">{t.auth.welcome}</h2>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthSubmit(new FormData(e.currentTarget));
                }} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">{t.auth.email}</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="example@mail.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">{t.auth.password}</label>
                  <input 
                    type="password" 
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-500/30"
                >
                  {t.auth.login}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>{t.auth.invitationOnly}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

