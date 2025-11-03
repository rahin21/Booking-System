'use client'

import { motion, MotionProps } from 'framer-motion'
import React from 'react'

type Props = React.PropsWithChildren<{
  className?: string
  delay?: number
  y?: number
} & MotionProps>

export default function AnimateIn({ children, className, delay = 0, y = 12, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}