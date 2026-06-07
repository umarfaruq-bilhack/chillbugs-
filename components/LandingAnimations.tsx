'use client'

import { useEffect, useRef } from 'react'

interface Props {
  playerCount: number
  wlPercent: number
}

export function LandingAnimations({ playerCount, wlPercent }: Props) {

  // Scroll fade-in observer
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-hidden')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('scroll-visible')
            }, i * 80)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Counter animation for player count
  useEffect(() => {
    const el = document.getElementById('player-count')
    if (!el || playerCount === 0) return
    let start = 0
    const duration = 1500
    const step = duration / playerCount
    const timer = setInterval(() => {
      start += Math.ceil(playerCount / 60)
      if (start >= playerCount) {
        start = playerCount
        clearInterval(timer)
      }
      el.textContent = start.toLocaleString()
    }, step > 16 ? step : 16)
    return () => clearInterval(timer)
  }, [playerCount])

  // Progress bar animation
  useEffect(() => {
    const bar = document.getElementById('wl-bar')
    if (!bar) return
    bar.style.width = '0%'
    setTimeout(() => {
      bar.style.transition = 'width 1.2s ease'
      bar.style.width = `${wlPercent}%`
    }, 600)
  }, [wlPercent])

  return null
}
