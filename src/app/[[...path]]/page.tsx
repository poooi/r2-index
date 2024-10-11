import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

async function listBucket(
  bucket: R2Bucket,
  options?: R2ListOptions
): Promise<R2Objects> {
  // List all objects in the bucket, launch new request if list is truncated
  const objects: R2Object[] = [];
  const delimitedPrefixes: string[] = [];

  // delete limit, cursor in passed options
  const requestOptions = {
    ...options,
    limit: undefined,
    cursor: undefined,
  };

  var cursor = undefined;
  while (true) {
    const index = await bucket.list({
      ...requestOptions,
      cursor,
    });
    objects.push(...index.objects);
    delimitedPrefixes.push(...index.delimitedPrefixes);
    if (!index.truncated) {
      break;
    }
    cursor = index.cursor;
  }
  return {
    objects,
    delimitedPrefixes,
    truncated: false,
  };
}

export default async function Home({
  params: { path = [] },
}: {
  params: { path?: string[] };
}) {
  const host = headers().get("host");

  const bucket = (await getCloudflareContext()).env.BUCKET_POI_NIGHTLIES;

  const prefix = path.length > 0 ? `${path.join("/")}/` : '';

  const index = await listBucket(bucket, {
    prefix,
    delimiter: "/",
    include: ["httpMetadata", "customMetadata"],
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {host}
      {prefix}
      {index.objects.map((object) => (
       <h1 key={object.key}>{object.key}</h1>
      ))}
      {
        index.delimitedPrefixes.map((prefix) => (
          <h1 key={prefix}>{prefix}</h1>
        ))
      }
    </main>
  );
}
