import { motion } from "framer-motion";

function TituloPage({ titulo }: { titulo: string }) {
  return (
    <>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">{titulo}</h1>
      </div>
      <motion.div
        style={{
          background: "linear-gradient(to right, #a855f7, #ec4899, #ef4444)",
          backgroundSize: "200% 100%",
          height: "4px",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </>
  );
}

export default TituloPage;
