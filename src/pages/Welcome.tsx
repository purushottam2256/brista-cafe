import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Coffee, CupSoda } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import PageTransition from '@/components/PageTransition';
import FAQButton from '@/components/FAQButton'; 

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Welcome = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  
  // Remove cursor tracking for cup rotation
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hide splash screen after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleStart = () => {
    navigate('/menu');
  };

  return (
    <PageTransition className="relative min-h-screen w-full overflow-hidden bg-cafe-bg safe-area-padding">
      {/* Animated splash screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-cafe"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6"
            >
              <Logo size="lg" className="text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Coffee beans floating in background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute -left-10 top-20 h-12 w-12 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, -30, 0, -15, 0],
            x: [0, 15, 30, 45, 60],
            rotate: [0, 45, 90, 135, 180]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute right-20 top-40 h-8 w-8 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, 40, 10, 30, 0],
            x: [0, -20, -40, -20, 0],
            rotate: [180, 135, 90, 45, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/4 h-16 w-16 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, -20, -40, -20, 0],
            rotate: [0, 180, 360, 180, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/4 h-10 w-10 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, 30, 10, 40, 0],
            x: [0, -10, -20, -10, 0],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 17, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      
      {/* Parallax depth layers */}
      <div className="fixed inset-0 z-1 overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            x: [0, 10, 0, -10, 0], 
            y: [0, -10, 0, 10, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl"/>
          <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-amber-800/10 blur-3xl"/>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-10 coffee-pattern opacity-20"></div>
      
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 py-8" ref={containerRef}>
        <div className="w-full max-w-md">
          <div className="text-center">
            <motion.div
              className="mx-auto mb-8 inline-block"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Logo size="lg" />
            </motion.div>
            
            <motion.h1 
              className="mb-3 text-4xl md:text-5xl font-bold text-cafe-dark overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Welcome to{" "}
                <motion.span 
                  className="bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text px-2 text-transparent inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1, 
                    type: "spring", 
                    stiffness: 100
                  }}
                >
                  Barista@star
                </motion.span>
              </motion.div>
            </motion.h1>
            
            <motion.p
              className="mb-10 text-lg text-cafe-text/80"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Crafting perfect moments, one cup at a time
            </motion.p>
            
            {/* COFFEE FALLING FROM SKY ANIMATION */}
            <motion.div
              className="mb-12 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="relative h-60 w-60 md:h-72 md:w-72">
                {/* Circle light background */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-50 to-amber-100/0"
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Wooden table surface */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full bg-gradient-to-t from-amber-900/30 to-amber-800/10" />
                
                {/* Main coffee cup with shadow */}
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
                  {/* Cup shadow */}
                  <motion.div
                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-black/20 blur-md"
                    animate={{ width: ["5.5rem", "6rem", "5.5rem"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Cup and saucer */}
                  <div className="relative">
                    {/* Saucer */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-36 rounded-full bg-gradient-to-r from-white via-gray-100 to-white border border-amber-200/50" />
                    
                    {/* Cup body */}
                    <motion.div
                      className="relative h-24 w-32 rounded-b-[3rem] rounded-t-xl overflow-hidden bg-white border border-amber-200/80"
                      animate={{ 
                        y: [0, -1, 0],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Coffee inside cup */}
                      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-b from-amber-700 to-amber-900">
                        {/* Coffee surface */}
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600/40 via-amber-700/60 to-amber-600/40"
                          animate={{ 
                            x: ["-5%", "5%", "-5%"]
                          }}
                          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        {/* Subtle coffee ripples */}
                        <motion.div
                          className="absolute top-6 left-1/4 h-1 w-8 rounded-full bg-amber-600/20"
                          animate={{ 
                            opacity: [0, 0.5, 0],
                            width: ["1rem", "2rem", "1rem"],
                            x: ["-50%", "50%", "-50%"]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                    
                    {/* Cup handle */}
                    <div className="absolute right-[-14px] top-6 h-12 w-8 border-r-[6px] border-t-[6px] border-b-[6px] rounded-r-full border-white/90" />
                  </div>
                </div>
                
                {/* Enhanced coffee steam/smoke */}
                <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-20">
                  {/* Main steam columns */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-white/80"
                      style={{
                        width: 8 - Math.min(i, 4),
                        height: 30 + i * 8,
                        left: `${10 + (i % 3) * 15}px`,
                        filter: "blur(4px)",
                        opacity: 0
                      }}
                      animate={{
                        y: [0, -60 - i * 15],
                        x: [0, ((i % 3) - 1) * 20],
                        opacity: [0, 0.4, 0],
                        scale: [1, 1.5, 0.8]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Buttons */}
            <div className="w-full space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Button 
                  className="w-full rounded-xl h-14 bg-cafe hover:bg-cafe-dark text-lg touch-manipulation"
                  onClick={handleStart}
                  onTouchEnd={handleStart}
                >
                  <span>Start Ordering</span>
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Button 
                  className="w-full rounded-xl h-14 bg-white border border-cafe/20 text-cafe-dark hover:bg-cafe/5 touch-manipulation text-lg"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                >
                  Admin Login
                </Button>
              </motion.div>
            </div>
            
            {/* FAQ Button */}
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <FAQButton className="mx-auto" />
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Welcome;