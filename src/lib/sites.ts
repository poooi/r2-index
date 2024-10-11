interface Site {
  title: string
  bucket: R2Bucket
  description: string
}

export const getSite = (env: CloudflareEnv, hostname: string) => {
  const sites: Record<string, Site> = {
    'nightlies.poi.moe': {
      title: 'poi nightlies',
      bucket: env.BUCKET_POI_NIGHTLIES,
      description: 'poi nightly builds',
    },
    'db.poi.moe': {
      title: 'poi-db monthly dumps',
      bucket: env.BUCKET_POI_DB,
      description: 'poi-db monthly dumps',
    },
  }

  return sites[hostname] ?? sites['nightlies.poi.moe']
}
