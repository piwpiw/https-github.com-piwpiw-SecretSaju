import { motion, useScroll, useSpring } from 'framer-motion';

export default function ReadingProgressBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-[200] shadow-[0_0_10px_#6366f1]"
            style={{ scaleX }}
        />
    );
}
