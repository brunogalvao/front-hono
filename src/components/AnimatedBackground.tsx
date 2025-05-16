import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-gray-100 overflow-hidden -z-10">
        <motion.div
          className="absolute w-[200%] h-[200%] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
          animate={{
            x: ["-50%", "0%"],
            y: ["-50%", "0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      </div>
    </>
  );
};

export default AnimatedBackground;