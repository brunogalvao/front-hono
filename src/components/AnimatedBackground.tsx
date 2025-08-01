import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <>
      <div className="fixed top-0 right-0 bottom-0 left-0 -z-10 h-full w-full overflow-hidden bg-gray-100">
        <motion.div
          style={{
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(to right, #a855f7, #ec4899, #ef4444)',
          }}
          animate={{
            x: ['-50%', '0%'],
            y: ['-50%', '0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      </div>
    </>
  );
};

export default AnimatedBackground;
