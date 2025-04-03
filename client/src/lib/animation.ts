import { Variants } from 'framer-motion';

// Spring animations for smoother, more natural motion
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Common animation variants that can be reused across components
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export const scaleInVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      duration: 0.4,
      ...springTransition
    } 
  }
};

// Animation for items that appear one after another
export const staggerChildren = (staggerTime = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerTime
    }
  }
});

// Animation for progress bar filling
export const progressVariants: Variants = {
  initial: (value: number) => ({
    width: 0
  }),
  animate: (value: number) => ({
    width: `${value}%`,
    transition: { 
      duration: 0.8, 
      ease: "easeOut"
    }
  })
};

// Animation for check icon appearing
export const checkVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
      delay: 0.2
    }
  }
};