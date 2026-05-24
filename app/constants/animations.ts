export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // Dipercepat dari 0.05
      delayChildren: 0.05
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 }, // Menghilangkan 'scale' dan mengurangi jarak 'y'
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3, // Menggunakan durasi tetap (tween) daripada spring yang berat
      ease: "easeOut"
    }
  }
};

export const pageVariants = {
  initial: { opacity: 0 }, // Menghilangkan 'x' agar tidak ada pergeseran layout yang berat
  animate: { 
    opacity: 1, 
    transition: {
      duration: 0.3,
      ease: "linear"
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};
