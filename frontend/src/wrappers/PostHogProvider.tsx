'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import React, { Suspense, useEffect } from 'react'
import { ENVIRONMENT, POSTHOG_HOST, POSTHOG_KEY } from 'utils/env.client'

const isPostHogEnabled =
  (ENVIRONMENT === 'staging' || ENVIRONMENT === 'production') && POSTHOG_KEY && POSTHOG_HOST

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
