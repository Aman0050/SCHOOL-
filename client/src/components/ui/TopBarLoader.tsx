import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const TopBarLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress while the component is mounted
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 90);
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "easeOut", duration: 0.2 }}
      />
    </div>
  );
};
