import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default async function NotFound() {
  return (
    <main className="relative flex min-h-screen max-w-screen-2xl flex-col p-4">
      <section className="grow">
        <h1 className="my-8 text-2xl leading-loose">poi?</h1>
        <p>Could not find requested resource</p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </section>
      <footer className="mt-16">
        <span>{`© ${new Date().getFullYear()} poi Contributors`}</span>
        {process.env.COMMIT_HASH && (
          <>
            <span> | </span>
            <span>
              poi R2 index version {process.env.COMMIT_HASH.slice(0, 8)}/
              {process.env.BUILD_DATE}
            </span>
          </>
        )}
      </footer>
    </main>
  )
}
