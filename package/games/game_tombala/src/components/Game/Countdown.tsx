import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  count: number;
}

const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-9xl font-bold text-white"
        >
          {count}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Countdown;