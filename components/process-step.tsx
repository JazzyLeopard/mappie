import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface ProcessStepProps {
  title: string
  description: string
  icon: string | React.ReactNode
  aiFeature: React.ReactNode
  isFirst?: boolean
  isLast?: boolean
}

export function ProcessStep({ title, description, icon, aiFeature, isFirst = false, isLast = false }: ProcessStepProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const animationProps = isFirst
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 50 },
        animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
        transition: { duration: 0.5 }
      }

  return (
    <motion.div
      ref={ref}
      className="space-y-4"
      {...animationProps}
    >
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="text-4xl flex-shrink-0">
            {typeof icon === 'string' ? icon : icon}
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-white text-opacity-80 mb-2">{description}</p>
            {aiFeature}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
      )}
    </motion.div>
  )
}

