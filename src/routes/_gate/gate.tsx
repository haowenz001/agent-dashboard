import { createFileRoute } from '@tanstack/react-router'
import { GateOverview } from '@/features/gate/overview'

export const Route = createFileRoute('/_gate/gate')({
  component: GateOverview,
})
