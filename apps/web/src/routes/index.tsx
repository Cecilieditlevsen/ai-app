import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/utils/trpc'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

const TITLE_TEXT = `
 Hello
 `

function HomeComponent() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions())
  const { data } = useQuery(trpc.person.getAll.queryOptions())

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <ul>{data?.map((person) => <li key={person.id}>{person.name}</li>)}</ul>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck.isLoading
                ? 'Checking...'
                : healthCheck.data
                  ? 'Connected'
                  : 'Disconnected'}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
