import { createFileRoute } from '@tanstack/react-router'
import { GateShell } from '@/features/gate/components/gate-shell'

export const Route = createFileRoute('/_gate')({
  component: GateShell,
})
