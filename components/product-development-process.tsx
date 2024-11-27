"use client"

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { ProcessStep } from './process-step'
import { AITag } from './ai-tag'
import { AISuggestion } from './ai-suggestion'

export default function ProductDevelopmentProcess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F596D3] via-[#A855D8] to-[#39aed8] rounded-3xl flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-16 p-8 rounded-3xl">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          AI-Enhanced Product Analysis
        </h1>
        <ProcessStep
          title="Create Product Requirements"
          description="Define the product's features, functionalities, and objectives"
          icon="📋"
          aiFeature={<AITag text="AI-Powered Ideation" />}
          isFirst={true}
        />
        <ProcessStep
          title="AI-Assisted Analysis"
          description="Leverage AI to analyze requirements and suggest optimizations"
          icon={<Sparkles className="w-8 h-8 text-yellow-300" />}
          aiFeature={
            <img src="/ai-edit.png" alt="AI Suggestion" width={500} height={300} />
          }
        />
        <ProcessStep
          title="Functional Analysis"
          description="Break down requirements into specific functions and capabilities"
          icon="🔍"
          aiFeature={<AITag text="AI Function Mapping" />}
        />
        <ProcessStep
          title="Create Epics"
          description="Group related features and functionalities into larger work items"
          icon="📚"
          aiFeature={<AITag text="AI-Driven Epic Prioritization" />}
        />
        <ProcessStep
          title="Create User Stories"
          description="Break down epics into smaller, manageable tasks for development"
          icon="📝"
          aiFeature={<AITag text="AI Story Refinement" />}
          isLast={true}
        />
      </div>
    </div>
  )
}

