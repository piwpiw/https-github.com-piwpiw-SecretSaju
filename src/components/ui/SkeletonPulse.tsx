import { motion } from 'framer-motion';

interface SkeletonPulseProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export default function SkeletonPulse({ className = "", variant = 'rect' }: SkeletonPulseProps) {
    const variantClasses = {
        text: 'h-4 w-full rounded-md',
        rect: 'h-full w-full rounded-2xl',
        circle: 'h-12 w-12 rounded-full',
    };

    return (
        <div className={`relative overflow-hidden bg-white/5 ${variantClasses[variant]} ${className}`}>
            <motion.div
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
            />
        </div>
    );
}
