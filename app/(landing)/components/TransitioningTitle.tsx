'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const roles = ['Manager', 'Owner', 'Analyst', 'Expert']

export default function TransitioningTitle() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % roles.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-center leading-normal">
        <div className="flex flex-wrap justify-center items-center gap-x-3">
          <span>Become the Product</span>
          <div className="relative inline-flex">
            <AnimatePresence mode="wait">
              <motion.span
                key={roles[currentIndex]}
                initial={{ width: 0 }}
                animate={{ 
                  width: 'auto',
                  transition: {
                    width: { duration: 0.3 }
                  }
                }}
                exit={{ 
                  width: 0,
                  transition: {
                    width: { duration: 0.3 }
                  }
                }}
                className="whitespace-nowrap overflow-hidden mr-2 pb-1"
              >
                <span className="bg-gradient-to-r from-pink-400 to-blue-300 text-transparent bg-clip-text">
                  {roles[currentIndex]}
                </span>
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{
                x: roles[currentIndex].length * 0,
                transition: {
                  duration: 0.3
                }
              }}
              className="whitespace-nowrap"
            >
              developers love
            </motion.span>
          </div>
        </div>
      </h1>
    </div>
  )
}