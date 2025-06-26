import { motion, useInView } from "framer-motion";
import { memo, useRef } from "react";

type TypingEffectProps = {
  text: string;
  className?: string;
};
export default memo(function TypingEffect({
  text = "Typing Effect",
  className,
}: TypingEffectProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <p ref={ref} className={className}>
      {text.split("").map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.2, delay: index * 0.005 }}
        >
          {letter}
        </motion.span>
      ))}
    </p>
  );
});
