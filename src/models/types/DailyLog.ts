export interface DailyLog {
  id: string
  goalId: string
  logDate: string
  content: string
  extraActivities: string | null
  imageUris: string[]
  claudeResponse: string | null
  createdAt: string
}
