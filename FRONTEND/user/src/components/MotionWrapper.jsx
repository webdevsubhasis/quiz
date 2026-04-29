import { motion } from "framer-motion";

export default function MotionWrapper({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.5,
                delay,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}