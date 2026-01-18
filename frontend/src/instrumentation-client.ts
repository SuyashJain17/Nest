import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'
import {
  ENVIRONMENT,
  POSTHOG_HOST,
  POSTHOG_KEY,
  RELEASE_VERSION,
  SENTRY_DSN,
} from 'utils/env.client'

Sentry.init({
  debug: false,
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT.toLowerCase(),
  integrations: [Sentry.browserTracingIntegration, Sentry.replayIntegration],
  release: RELEASE_VERSION,
  replaysOnErrorSampleRate: 0.5,
  replaysSessionSampleRate: 0.5,
})

// Initialize PostHog for staging and production only
const normalizedEnv = ENVIRONMENT?.toLowerCase()
const isPostHogEnabled =
  (normalizedEnv === 'staging' || normalizedEnv === 'production') && POSTHOG_KEY && POSTHOG_HOST

if (isPostHogEnabled) {
  /* eslint-disable @typescript-eslint/naming-convention -- PostHog SDK requires snake_case */
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageleave: true,
    capture_pageview: false,
    person_profiles: 'identified_only',
  })
  /* eslint-enable @typescript-eslint/naming-convention */
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
