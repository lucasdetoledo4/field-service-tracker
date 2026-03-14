import { Text, Flex } from '@radix-ui/themes'
import { ArrowRight } from 'lucide-react'
import type { WorkOrderStatusHistory } from '../../types/work-order'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

interface Props {
  history: WorkOrderStatusHistory[]
}

export default function HistoryTimeline({ history }: Props) {
  if (history.length === 0) {
    return <Text size="2" color="gray">No history yet.</Text>
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 text-sm">
          <div className="flex-shrink-0 w-1 self-stretch bg-gray-200 rounded mt-1" />
          <div className="flex-1">
            <Flex align="center" gap="1" wrap="wrap">
              {entry.from_status ? (
                <>
                  <StatusPill status={entry.from_status} />
                  <ArrowRight size={12} className="text-gray-400" />
                </>
              ) : null}
              <StatusPill status={entry.to_status} />
            </Flex>
            {entry.notes && (
              <Text size="1" color="gray" as="div" mt="1">{entry.notes}</Text>
            )}
            <Text size="1" color="gray" as="div">
              {new Date(entry.created_at).toLocaleString()}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}
