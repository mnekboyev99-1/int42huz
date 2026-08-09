import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyFormWithAuthHeader,
  RequestBodyWithAuthHeader,
} from '@services/utils/ts/requests'

export async function uploadNewGenericFile(
  file: any,
  activity_uuid: string,
  access_token: string
) {
  const formData = new FormData()
  formData.append('file_object', file)
  formData.append('activity_uuid', activity_uuid)

  const result = await fetch(
    `${getAPIUrl()}blocks/file`,
    RequestBodyFormWithAuthHeader('POST', formData, null, access_token)
  )

  const data = await result.json()

  if (!result.ok) {
    const errorMessage = typeof data?.detail === 'string'
      ? data.detail
      : Array.isArray(data?.detail)
        ? data.detail.map((e: any) => e.msg).join(', ')
        : 'Upload failed'
    throw new Error(errorMessage)
  }

  return data
}

export async function getGenericFile(file_id: string, access_token: string) {
  return fetch(
    `${getAPIUrl()}blocks/file?file_id=${file_id}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
    .then((result) => result.json())
    .catch((error) => console.log('error', error))
}
