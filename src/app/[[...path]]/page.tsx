import { title } from 'process'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { SlashIcon } from '@radix-ui/react-icons'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Fragment } from 'react'

import { type Data, DataType } from './model'
import { IndexTable } from './table'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const generateMetadata = async (): Promise<Metadata> => {
  const host = headers().get('host')
  return {
    title: host!,
  }
}

async function listBucket(
  bucket: R2Bucket,
  options?: R2ListOptions,
): Promise<R2Objects> {
  // List all objects in the bucket, launch new request if list is truncated
  const objects: R2Object[] = []
  const delimitedPrefixes: string[] = []

  // delete limit, cursor in passed options
  const requestOptions = {
    ...options,
    limit: undefined,
    cursor: undefined,
  }

  let cursor = undefined
  while (true) {
    const index = await bucket.list({
      ...requestOptions,
      cursor,
    })
    objects.push(...index.objects)
    delimitedPrefixes.push(...index.delimitedPrefixes)
    if (!index.truncated) {
      break
    }
    cursor = index.cursor
  }
  return {
    objects,
    delimitedPrefixes,
    truncated: false,
  }
}

export default async function Home({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  const host = headers().get('host')

  const bucket = (await getCloudflareContext()).env.BUCKET_POI_NIGHTLIES

  const prefix = path.length > 0 ? `${path.join('/')}/` : ''

  const index = await listBucket(bucket, {
    prefix,
    delimiter: '/',
    include: ['httpMetadata', 'customMetadata'],
  })

  const data = [
    ...index.delimitedPrefixes.map((delimitedPrefix) => ({
      key: delimitedPrefix,
      href: `/${delimitedPrefix}`,
      type: DataType.Folder,
    })),
    ...index.objects.map((object) => ({
      key: object.key,
      href: object.key,
      type: DataType.File,
      size: object.size,
      modified: object.uploaded,
    })),
  ] satisfies Data[]

  return (
    <main className="flex min-h-screen flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {path.map((segment, index) => (
            <Fragment key={path.slice(0, index + 1).join('/')}>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${path.slice(0, index + 1).join('/')}`}>
                    {segment}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <IndexTable data={data} />
    </main>
  )
}
