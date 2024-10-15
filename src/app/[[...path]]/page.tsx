import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

import { FilterInput } from './filter-input'
import { type Data, DataType } from './model'
import { IndexTable } from './table'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getSite } from '@/lib/sites'

export const generateMetadata = async ({
  params: { path = [] },
}: {
  params: { path?: string[] }
}): Promise<Metadata> => {
  const host = headers().get('host')

  const cfContext = await getCloudflareContext()

  const site = getSite(cfContext.env, host!)
  return {
    title: `index of /${path.join('/')} | ${site.title}`,
    description: site.description,
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

const getBucketDataCacheKey = (prefix: string, host: string) =>
  `bucket-data:${host}:${prefix}`

export default async function Home({
  params: { path = [] },
}: {
  params: { path?: string[] }
}) {
  const host = headers().get('host')
  if (!host) {
    notFound()
  }

  const cfContext = await getCloudflareContext()

  const site = getSite(cfContext.env, host)

  const prefix = path.length > 0 ? `${path.join('/')}/` : ''

  let data: Data[] = []

  const cached = await cfContext.env.NEXT_CACHE_WORKERS_KV.get<string>(
    getBucketDataCacheKey(prefix, host),
  )

  if (cached !== null) {
    data = JSON.parse(cached) as Data[]
  } else {
    const result = await listBucket(site.bucket, {
      prefix,
      delimiter: '/',
      include: ['httpMetadata', 'customMetadata'],
    })

    data = [
      ...result.delimitedPrefixes.map((delimitedPrefix) => ({
        key: delimitedPrefix,
        href: `/${delimitedPrefix}`,
        type: DataType.Folder,
      })),
      ...result.objects.map((object) => ({
        key: object.key,
        href: `/${object.key}`,
        type: DataType.File,
        size: object.size,
        modified: object.uploaded.getTime(),
      })),
    ] satisfies Data[]
    cfContext.ctx.waitUntil(
      cfContext.env.NEXT_CACHE_WORKERS_KV.put(
        getBucketDataCacheKey(prefix, host),
        JSON.stringify(data),
        {
          expirationTtl: 60,
        },
      ),
    )
  }

  if (data.length === 0) {
    notFound()
  }

  return (
    <main className="relative flex min-h-screen max-w-screen-2xl flex-col p-4">
      <nav className="rounded border-2 bg-card px-4 py-2 text-xl">
        <h2 className="sr-only">Navigation</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{host}</Link>
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
      </nav>
      <h1 className="my-8 text-2xl leading-loose">{site.title}</h1>
      <section className="grow">
        <FilterInput />
        <IndexTable data={data} />
      </section>
      <footer className="mt-16">
        <span>{`© ${new Date().getFullYear()} poi Contributors`}</span>
      </footer>
    </main>
  )
}
