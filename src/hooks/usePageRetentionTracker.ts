import { useEffect, useRef } from "react"
import {
  trackScrollDepth,
  trackEngagementMilestone,
  trackPageEngagementSummary,
} from "@/utils/analytics"

const TIME_MILESTONES = [15, 30, 45, 60, 90, 120, 180, 300]
const SCROLL_MILESTONES = [25, 50, 75, 90, 100]

/**
 * Hook to track user active engagement time and scroll depth per page.
 * Fires milestones and a consolidated page_engagement_summary on exit.
 */
export function usePageRetentionTracker(pagePath: string) {
  // Keep refs across renders
  const activeSecondsRef = useRef(0)
  const maxScrollRef = useRef(0)
  const firedTimeMilestonesRef = useRef<Set<number>>(new Set())
  const firedScrollMilestonesRef = useRef<Set<number>>(new Set())
  const hasSentSummaryRef = useRef(false)

  useEffect(() => {
    // Reset state for new page
    activeSecondsRef.current = 0
    maxScrollRef.current = 0
    firedTimeMilestonesRef.current = new Set()
    firedScrollMilestonesRef.current = new Set()
    hasSentSummaryRef.current = false

    // Function to calculate and track scroll depth
    const checkScrollDepth = () => {
      if (typeof window === "undefined" || typeof document === "undefined") return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      )
      const winHeight = window.innerHeight || document.documentElement.clientHeight
      const scrollable = docHeight - winHeight

      const currentPercent = scrollable > 0 
        ? Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)))
        : 100 // Short page with everything visible

      if (currentPercent > maxScrollRef.current) {
        maxScrollRef.current = currentPercent
      }

      // Check milestones
      for (const milestone of SCROLL_MILESTONES) {
        if (currentPercent >= milestone && !firedScrollMilestonesRef.current.has(milestone)) {
          firedScrollMilestonesRef.current.add(milestone)
          trackScrollDepth(milestone, pagePath, document.title)
        }
      }
    }

    // Scroll listener with requestAnimationFrame throttling
    let scrollScheduled = false
    const handleScroll = () => {
      if (!scrollScheduled) {
        scrollScheduled = true
        requestAnimationFrame(() => {
          checkScrollDepth()
          scrollScheduled = false
        })
      }
    }

    // Initial check after short delay (letting React render page contents)
    const initialCheckTimer = setTimeout(() => {
      checkScrollDepth()
    }, 400)

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })

    // Active time counter (1s tick) - only when document is visible
    const timerInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        activeSecondsRef.current += 1
        const currentSeconds = activeSecondsRef.current

        // Check time milestones
        for (const milestone of TIME_MILESTONES) {
          if (currentSeconds >= milestone && !firedTimeMilestonesRef.current.has(milestone)) {
            firedTimeMilestonesRef.current.add(milestone)
            trackEngagementMilestone(milestone, pagePath, document.title)
          }
        }
      }
    }, 1000)

    // Helper to send final page summary once
    const sendSummary = () => {
      if (hasSentSummaryRef.current) return
      hasSentSummaryRef.current = true

      trackPageEngagementSummary({
        pagePath,
        pageTitle: typeof document !== "undefined" ? document.title : "",
        activeSeconds: activeSecondsRef.current,
        maxScrollPercent: maxScrollRef.current,
      })
    }

    // Visibility change / tab hide listener (flush summary if leaving tab or closing browser)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendSummary()
      } else {
        // If user returns, allow new summary on subsequent leave
        hasSentSummaryRef.current = false
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", sendSummary)

    // Cleanup when route changes or component unmounts
    return () => {
      clearTimeout(initialCheckTimer)
      clearInterval(timerInterval)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", sendSummary)

      sendSummary()
    }
  }, [pagePath])
}

