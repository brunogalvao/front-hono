import { motion } from 'framer-motion';

function TituloPage({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <>
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold">{titulo}</h1>
          {subtitulo && (
            <p className="text-muted-foreground mt-0.5 text-sm">{subtitulo}</p>
          )}
        </div>
      </div>
      <motion.div
        style={{
          background: 'linear-gradient(to right, #a855f7, #ec4899, #ef4444)',
          backgroundSize: '200% 100%',
          height: '4px',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </>
  );
}

export default TituloPage;
