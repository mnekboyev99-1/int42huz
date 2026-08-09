'use client'
import React from 'react'
import useSWR from 'swr'
import { getAPIUrl } from '@services/config/config'
import { swrFetcher } from '@services/utils/ts/requests'
import { useAuth } from '@components/Contexts/AuthContext'
import EditorSkeleton from './EditorSkeleton'
import EditorWrapper from './EditorWrapper'
import MarkdownActivity from '@components/Objects/Activities/Markdown/MarkdownActivity'
import EmbedActivity from '@components/Objects/Activities/Embed/EmbedActivity'
import OnboardingBar from '@components/Dashboard/Onboarding/OnboardingBar'

interface EditorLoaderProps {
  courseid: string
  activityuuid: string
}

/**
 * Single entry point for the editor page. Fetches the editor's full bootstrap
 * payload (activity + slim course + org with resolved features) in one request.
 *
 * Uses `useAuth().accessToken` rather than `useSession().data.tokens` so the
 * bootstrap fetch can race the `/users/session` call in parallel: the bare
 * access token is set the moment `/api/auth/refresh` resolves, while
 * `session.data` only populates after the subsequent `/users/session` call.
 */
export default function EditorLoader({ courseid: _courseid, activityuuid }: EditorLoaderProps) {
  const { accessToken: access_token } = useAuth()
  const [editorReady, setEditorReady] = React.useState(false)

  const { data: bootstrap, error: bootstrapError } = useSWR(
    access_token
      ? `${getAPIUrl()}activities/activity_${activityuuid}/editor-bootstrap`
      : null,
    (url) => swrFetcher(url, access_token ?? undefined),
    { revalidateOnFocus: false }
  )

  const [stableData, setStableData] = React.useState<{
    org: any
    course: any
    activity: any
    content: any
  } | null>(null)

  React.useEffect(() => {
    if (bootstrap?.org && bootstrap?.activity) {
      setStableData((prev) => {
        if (prev) {
          return {
            ...prev,
            org: bootstrap.org,
            course: bootstrap.course,
            activity: bootstrap.activity,
          }
        }
        return {
          org: bootstrap.org,
          course: bootstrap.course,
          activity: bootstrap.activity,
          content: bootstrap.activity.content,
        }
      })
    }
  }, [bootstrap])

  if (bootstrapError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <p className="text-sm">Failed to load editor. Please refresh the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-600 hover:underline"
        >
          Refresh
        </button>
      </div>
    )
  }

  const isMarkdownActivity = stableData?.activity?.activity_sub_type === 'SUBTYPE_DYNAMIC_MARKDOWN'
  const isEmbedActivity = stableData?.activity?.activity_sub_type === 'SUBTYPE_DYNAMIC_EMBED'

  if (isMarkdownActivity && stableData) {
    return <MarkdownActivity activity={stableData.activity} editable />
  }

  if (isEmbedActivity && stableData) {
    return <EmbedActivity activity={stableData.activity} editable />
  }

  return (
    <div className="relative">
      {/* Skeleton — fades out when editor is ready */}
      <div
        style={{
          opacity: editorReady ? 0 : 1,
          transition: 'opacity 300ms ease-out',
          pointerEvents: editorReady ? 'none' : 'auto',
          position: editorReady ? 'fixed' : 'relative',
          inset: 0,
          zIndex: editorReady ? 50 : 'auto',
        }}
      >
        <EditorSkeleton />
      </div>

      {/* Editor — mounts when stable data is ready, stays mounted */}
      {stableData && (
        <div
          style={{
            opacity: editorReady ? 1 : 0,
            transition: 'opacity 300ms ease-out',
          }}
        >
          <EditorWrapper
            org={stableData.org}
            course={stableData.course}
            activity={stableData.activity}
            content={stableData.content}
            onEditorReady={() => setEditorReady(true)}
          />
        </div>
      )}
      <OnboardingBar />
    </div>
  )
}
