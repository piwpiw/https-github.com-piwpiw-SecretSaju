'use client';

import { useEffect } from 'react';
import { initKakao, loginWithKakao } from '@/lib/auth/kakao-auth';
import { motion } from 'framer-motion';

interface KakaoLoginButtonProps {
    className?: string;
    onLoginStart?: () => void;
}

export default function KakaoLoginButton({ className, onLoginStart }: KakaoLoginButtonProps) {
    useEffect(() => {
        // Initialize Kakao SDK when component mounts
        initKakao();
    }, []);

    const handleLogin = () => {
        onLoginStart?.();
        loginWithKakao();
    };

    return (
        <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-6 rounded-xl bg-[#FEE500] hover:bg-[#FDDC3F] transition flex items-center justify-center gap-3 font-medium ${className}`}
        >
            {/* Kakao Logo SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M10 0C4.477 0 0 3.64 0 8.125c0 2.886 1.948 5.413 4.861 6.85l-1.042 3.853c-.083.306.224.556.505.411l4.508-2.327c.387.03.779.046 1.168.046 5.523 0 10-3.64 10-8.125S15.523 0 10 0z"
                    fill="#000000"
                />
            </svg>
            <span className="text-black font-bold">카카오 로그인</span>
        </motion.button>
    );
}
