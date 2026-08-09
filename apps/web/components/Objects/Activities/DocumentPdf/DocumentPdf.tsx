import { useOrg } from '@components/Contexts/OrgContext'
import { getActivityMediaDirectory } from '@services/media/media'
import React from 'react'
import PDFSlideViewer from './PDFSlideViewer'

function DocumentPdfActivity({
  activity,
  course,
  orgUuid,
  className,
}: {
  activity: any
  course: any
  orgUuid?: string
  className?: string
}) {
  const org = useOrg() as any
  const resolvedOrgUuid = orgUuid || org?.org_uuid

  const pdfUrl = getActivityMediaDirectory(
    resolvedOrgUuid,
    course?.course_uuid,
    activity.activity_uuid,
    activity.content?.filename || activity.content?.file_id,
    'documentpdf'
  )

  return (
    <div className={className ?? "m-0 sm:m-8 sm:rounded-md mt-0 sm:mt-14"}>
      <PDFSlideViewer
        pdfUrl={pdfUrl || ''}
        title={activity?.name || activity?.title || 'PDF Slayd'}
        className={className ? "w-full h-full" : "w-full h-[85vh] sm:h-[900px]"}
      />
    </div>
  )
}

export default DocumentPdfActivity
