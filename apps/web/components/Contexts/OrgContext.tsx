'use client'
import { getAPIUrl } from '@services/config/config'
import { swrFetcher } from '@services/utils/ts/requests'
import React, { createContext, useContext, useMemo, useEffect } from 'react'
import useSWR from 'swr'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import ErrorUI from '@components/Objects/StyledElements/Error/Error'
import { getOrgFontMediaDirectory } from '@services/media/media'

interface OrgContextValue {
  org: any
  isUserPartOfTheOrg: boolean
  orgslug: string
}

export const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({
  children,
  orgslug,
  initialOrg,
}: {
  children: React.ReactNode
  orgslug: string
  initialOrg?: any
}) {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const { data: org, error: orgError } = useSWR(
    `${getAPIUrl()}orgs/slug/${orgslug}`,
    (url) => swrFetcher(url, accessToken),
    {
      revalidateOnFocus: false,
      // When the caller already has org data (e.g. from the editor bootstrap),
      // hydrate SWR with it so renders don't block on a redundant fetch.
      // SWR will revalidate in the background after the initial paint.
      revalidateOnMount: !initialOrg,
      fallbackData: initialOrg ?? undefined,
    }
  )

  // Dynamic custom font face injection
  useEffect(() => {
    if (!org) return

    const customFonts =
      org.config?.config?.customization?.general?.custom_fonts ||
      org.config?.config?.custom_fonts

    if (!customFonts || !Array.isArray(customFonts)) return

    const styleId = 'lh-custom-fonts-style'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }

    const rules = customFonts
      .map((font: any) => {
        if (!font.name || !font.file) return ''
        const fontUrl = getOrgFontMediaDirectory(org.org_uuid, font.file)
        
        let format = 'truetype'
        if (font.file.endsWith('.woff2')) format = 'woff2'
        else if (font.file.endsWith('.woff')) format = 'woff'
        else if (font.file.endsWith('.otf')) format = 'opentype'

        return `
          @font-face {
            font-family: '${font.name.replace(/'/g, "\\'")}';
            src: url('${fontUrl}') format('${format}');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `
      })
      .join('\n')

    styleEl.innerHTML = rules
  }, [org])

  const isOrgActive = useMemo(() => (org?.config?.config?.active ?? org?.config?.config?.general?.enabled) !== false, [org])

  // Determine membership from session roles (available immediately, no extra API call).
  // Session roles contain ALL orgs the user belongs to — no pagination limit.
  const isUserPartOfTheOrg = useMemo(() => {
    if (session.status !== 'authenticated') return true
    if (!org?.id) return true // Don't show guest banner while org is loading

    // Check session roles
    const roles = session?.data?.roles
    if (roles && Array.isArray(roles)) {
      if (roles.some((r: any) => r.org?.id === org.id)) return true
    }

    // Superadmins are always part of every org
    if (session?.data?.user?.is_superadmin) return true

    return false
  }, [session?.data?.roles, session?.data?.user?.is_superadmin, org?.id, session.status])

  const contextValue = useMemo<OrgContextValue>(() => ({
    org,
    isUserPartOfTheOrg,
    orgslug,
  }), [org, isUserPartOfTheOrg, orgslug])

  if (orgError) return <ErrorUI message='An error occurred while fetching data' />
  if (!org || !session) return <div></div>
  if (!isOrgActive) return <ErrorUI message='This organization is no longer active' />

  return <OrgContext.Provider value={contextValue}>{children}</OrgContext.Provider>
}

// Backward compatible hook - returns just the org object
export function useOrg() {
  const context = useContext(OrgContext)
  return context?.org ?? null
}

// New hook to get membership status
export function useOrgMembership() {
  const context = useContext(OrgContext)
  return {
    org: context?.org ?? null,
    isUserPartOfTheOrg: context?.isUserPartOfTheOrg ?? true,
    orgslug: context?.orgslug ?? '',
  }
}
