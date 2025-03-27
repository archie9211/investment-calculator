import {
  motion,
  useSpring,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter = (v) => v.toString(),
  className,
}) => {
  const controls = useAnimationControls();
  const spring = useSpring(0, {
    stiffness: 200,
    damping: 20,
    duration: 0.3,
    mass: 0.5,
    restSpeed: 0.5,
  });

  const display = useTransform(spring, (current) => formatter(current));

  useEffect(() => {
    controls.start({ scale: 1.1 });
    spring.set(value);

    // Reset scale after spring animation
    const timeout = setTimeout(() => {
      controls.start({ scale: 1 });
    }, 300); // Match duration of spring

    return () => clearTimeout(timeout);
  }, [value, spring, controls]);

  return (
    <motion.span
      animate={controls}
      initial={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.3 }}
      className={className}
    >
      {display}
    </motion.span>
  );
};

export default AnimatedNumber;
