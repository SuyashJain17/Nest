'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import React, { Suspense, useEffect } from 'react'
import { ENVIRONMENT, POSTHOG_HOST, POSTHOG_KEY } from 'utils/env.client'

const normalizedEnv = ENVIRONMENT?.toLowerCase()
const isPostHogEnabled =
  (normalizedEnv === 'staging' || normalizedEnv === 'production') && POSTHOG_KEY && POSTHOG_HOST

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthogClient = usePostHog()

  useEffect(() => {
    if (pathname && posthogClient && globalThis.window !== undefined) {
      let url = globalThis.window.location.origin + pathname
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
      // eslint-disable-next-line @typescript-eslint/naming-convention -- PostHog SDK naming
      posthogClient.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthogClient])

  return null
}

export function PostHogProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    if (isPostHogEnabled && POSTHOG_KEY) {
      /* eslint-disable @typescript-eslint/naming-convention -- PostHog SDK requires snake_case */
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageleave: true,
        capture_pageview: false,
      })
      /* eslint-enable @typescript-eslint/naming-convention */
    }
  }, [])

  if (!isPostHogEnabled) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
