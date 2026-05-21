export type GoalStatus = 'active' | 'achieved' | 'paused'

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  status: GoalStatus
  achievedAt: string | null
  createdAt: string
}
