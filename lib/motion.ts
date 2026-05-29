"use client"

import { useReducedMotion } from "framer-motion"
import type { Transition, Variants } from "framer-motion"

export const motionEase = [0.22, 1, 0.36, 1] as const

export const fadeSlideVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
}

export const scaleFadeVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export const collapseVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
}

export const emptyStateContainerVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
  exit: { opacity: 0, y: 4, transition: { duration: 0.18, ease: motionEase } },
}

export const emptyStateChildVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
}

export function useMotionTransition(duration = 0.22): Transition {
  const reduce = useReducedMotion()
  if (reduce) return { duration: 0 }
  return { duration, ease: motionEase }
}

export function useCollapseTransition(): Transition {
  return useMotionTransition(0.22)
}

export function useFadeSlideMotionProps(duration = 0.22) {
  const transition = useMotionTransition(duration)
  const reduce = useReducedMotion()
  return {
    variants: fadeSlideVariants,
    initial: (reduce ? false : "initial") as false | "initial",
    animate: "animate" as const,
    exit: "exit" as const,
    transition,
  }
}

export function useEmptyStateMotionProps() {
  const reduce = useReducedMotion()
  const transition = useMotionTransition(0.24)
  if (reduce) {
    return {
      variants: fadeSlideVariants,
      initial: false as const,
      animate: "animate" as const,
      exit: "exit" as const,
      transition,
      stagger: false,
    }
  }
  return {
    variants: emptyStateContainerVariants,
    initial: "initial" as const,
    animate: "animate" as const,
    exit: "exit" as const,
    transition,
    stagger: true,
  }
}

export function useRowMotionTransition() {
  const reduce = useReducedMotion()
  if (reduce) {
    return {
      layout: false as const,
      transition: { duration: 0 },
      enterY: 0,
      exitY: 0,
    }
  }
  return {
    layout: true as const,
    transition: {
      layout: { type: "spring" as const, stiffness: 400, damping: 36 },
      opacity: { duration: 0.16 },
      y: { duration: 0.16 },
    },
    enterY: 4,
    exitY: -4,
  }
}
