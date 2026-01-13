'use client';

import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ 
  message, 
  size = 'md',
  className = 'bg-white rounded-2xl p-6 shadow-sm'
}: LoadingSpinnerProps) {
  const sizeMultiplier = {
    sm: 0.5,
    md: 1,
    lg: 1.5,
  };

  const multiplier = sizeMultiplier[size];
  const width = 120 * multiplier;
  const height = 80 * multiplier;

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center gap-3">
        <div 
          className="relative"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Wave Background */}
          <svg
            viewBox="0 0 120 80"
            className="absolute inset-0"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            {/* Wave 1 */}
            <motion.path
              d="M 0 60 Q 20 50, 40 60 T 80 60 T 120 60 L 120 80 L 0 80 Z"
              fill="url(#waveGradient1)"
              animate={{
                d: [
                  "M 0 60 Q 20 50, 40 60 T 80 60 T 120 60 L 120 80 L 0 80 Z",
                  "M 0 60 Q 20 55, 40 60 T 80 60 T 120 60 L 120 80 L 0 80 Z",
                  "M 0 60 Q 20 50, 40 60 T 80 60 T 120 60 L 120 80 L 0 80 Z",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Wave 2 */}
            <motion.path
              d="M 0 70 Q 15 65, 30 70 T 60 70 T 90 70 T 120 70 L 120 80 L 0 80 Z"
              fill="url(#waveGradient2)"
              animate={{
                d: [
                  "M 0 70 Q 15 65, 30 70 T 60 70 T 90 70 T 120 70 L 120 80 L 0 80 Z",
                  "M 0 70 Q 15 68, 30 70 T 60 70 T 90 70 T 120 70 L 120 80 L 0 80 Z",
                  "M 0 70 Q 15 65, 30 70 T 60 70 T 90 70 T 120 70 L 120 80 L 0 80 Z",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Surfer */}
          <motion.div
            className="absolute"
            style={{
              left: '50%',
              top: '45%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 40 40"
              style={{ width: `${30 * multiplier}px`, height: `${30 * multiplier}px` }}
            >
              {/* Surfboard */}
              <motion.ellipse
                cx="20"
                cy="28"
                rx="12"
                ry="4"
                fill="#F59E0B"
                stroke="#D97706"
                strokeWidth="0.5"
                animate={{
                  rotate: [0, -2, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                transformOrigin="20 28"
              />
              {/* Surfer Body */}
              <motion.circle
                cx="20"
                cy="20"
                r="4"
                fill="#FBBF24"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Surfer Head */}
              <circle cx="20" cy="14" r="3" fill="#FCD34D" />
              {/* Arms */}
              <motion.path
                d="M 16 18 Q 12 20, 14 22"
                stroke="#FBBF24"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M 16 18 Q 12 20, 14 22",
                    "M 16 18 Q 12 19, 14 21",
                    "M 16 18 Q 12 20, 14 22",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M 24 18 Q 28 20, 26 22"
                stroke="#FBBF24"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M 24 18 Q 28 20, 26 22",
                    "M 24 18 Q 28 19, 26 21",
                    "M 24 18 Q 28 20, 26 22",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Legs */}
              <motion.path
                d="M 18 24 L 18 28"
                stroke="#FBBF24"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={{
                  pathLength: [1, 0.9, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M 22 24 L 22 28"
                stroke="#FBBF24"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={{
                  pathLength: [1, 0.9, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>

          {/* Water Splash Effects */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${30 + i * 30}%`,
                bottom: '20%',
                width: `${4 * multiplier}px`,
                height: `${4 * multiplier}px`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.6, 0, 0.6],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.2,
              }}
            >
              <div className="w-full h-full bg-cyan-400 rounded-full blur-sm" />
            </motion.div>
          ))}
        </div>
        {message && (
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}
