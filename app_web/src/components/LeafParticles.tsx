// src/components/LeafParticle.tsx
'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Leaf {
  id: number
  x: number
  delay: number
  duration: number
  scale: number
  rotate: number
}

export default function LeafParticles() {
  const [leaves, setLeaves] = useState<Leaf[]>([])

  useEffect(() => {
    const generated: Leaf[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random percent horizontal position
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20, // 15 to 35 seconds
      scale: 0.5 + Math.random() * 0.8,
      rotate: Math.random() * 360,
    }))
    setLeaves(generated)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          initial={{ y: '110vh', x: `${leaf.x}vw`, rotate: leaf.rotate, opacity: 0 }}
          animate={{
            y: '-10vh',
            x: [`${leaf.x}vw`, `${leaf.x + (Math.random() * 10 - 5)}vw`, `${leaf.x}vw`],
            rotate: leaf.rotate + 360,
            opacity: [0, 0.4, 0.4, 0],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: 'linear',
          }}
          className="absolute"
          style={{ width: `${leaf.scale * 16}px`, height: `${leaf.scale * 16}px` }}
        >
          {/* SVG representing a simple leaf */}
          <svg viewBox="0 0 24 24" fill="none" className="text-[#74C69D]/30 w-full h-full">
            <path
              d="M2 22C12 22 22 12 22 2c-10 0-20 10-20 20z"
              fill="currentColor"
            />
            <path
              d="M2 22L22 2"
              stroke="#52B788"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
