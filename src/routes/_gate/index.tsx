import { createFileRoute } from '@tanstack/react-router'
import { CommunityOverview } from '@/features/community/overview'

export const Route = createFileRoute('/_gate/')({
  component: CommunityOverview,
})
