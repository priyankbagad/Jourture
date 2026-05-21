import { getDatabase } from './database'
import { DailyLog } from '../types/DailyLog'

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// creates a new daily log entry
export const createLog = (
  goalId: string,
  content: string,
  extraActivities: string | null,
  imageUris: string[]
): DailyLog => {
  const db = getDatabase()
  const id = generateId()
  const createdAt = new Date().toISOString()
  const logDate = new Date().toISOString().split('T')[0]
  const imageUrisJson = JSON.stringify(imageUris)

  db.runSync(
    `INSERT INTO daily_logs (id, goal_id, log_date, content, extra_activities, image_uris, claude_response, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
    [id, goalId, logDate, content, extraActivities, imageUrisJson, createdAt]
  )

  return {
    id,
    goalId,
    logDate,
    content,
    extraActivities,
    imageUris,
    claudeResponse: null,
    createdAt
  }
}

// fetches all logs for a specific goal
export const getLogsByGoalId = (goalId: string): DailyLog[] => {
  const db = getDatabase()

  const rows = db.getAllSync<{
    id: string
    goal_id: string
    log_date: string
    content: string
    extra_activities: string | null
    image_uris: string
    claude_response: string | null
    created_at: string
  }>(`SELECT * FROM daily_logs WHERE goal_id = ? ORDER BY log_date DESC`, [goalId])

  return rows.map(row => ({
    id: row.id,
    goalId: row.goal_id,
    logDate: row.log_date,
    content: row.content,
    extraActivities: row.extra_activities,
    imageUris: JSON.parse(row.image_uris),
    claudeResponse: row.claude_response,
    createdAt: row.created_at
  }))
}

// fetches a single log by id
export const getLogById = (id: string): DailyLog | null => {
  const db = getDatabase()

  const row = db.getFirstSync<{
    id: string
    goal_id: string
    log_date: string
    content: string
    extra_activities: string | null
    image_uris: string
    claude_response: string | null
    created_at: string
  }>(`SELECT * FROM daily_logs WHERE id = ?`, [id])

  if (!row) return null

  return {
    id: row.id,
    goalId: row.goal_id,
    logDate: row.log_date,
    content: row.content,
    extraActivities: row.extra_activities,
    imageUris: JSON.parse(row.image_uris),
    claudeResponse: row.claude_response,
    createdAt: row.created_at
  }
}

// fetches all logs for a specific date across all goals
export const getLogsByDate = (date: string): DailyLog[] => {
  const db = getDatabase()

  const rows = db.getAllSync<{
    id: string
    goal_id: string
    log_date: string
    content: string
    extra_activities: string | null
    image_uris: string
    claude_response: string | null
    created_at: string
  }>(`SELECT * FROM daily_logs WHERE log_date = ? ORDER BY created_at DESC`, [date])

  return rows.map(row => ({
    id: row.id,
    goalId: row.goal_id,
    logDate: row.log_date,
    content: row.content,
    extraActivities: row.extra_activities,
    imageUris: JSON.parse(row.image_uris),
    claudeResponse: row.claude_response,
    createdAt: row.created_at
  }))
}

// checks if a log already exists for a goal on today's date
export const getTodayLogForGoal = (goalId: string): DailyLog | null => {
  const db = getDatabase()
  const today = new Date().toISOString().split('T')[0]

  const row = db.getFirstSync<{
    id: string
    goal_id: string
    log_date: string
    content: string
    extra_activities: string | null
    image_uris: string
    claude_response: string | null
    created_at: string
  }>(`SELECT * FROM daily_logs WHERE goal_id = ? AND log_date = ?`, [goalId, today])

  if (!row) return null

  return {
    id: row.id,
    goalId: row.goal_id,
    logDate: row.log_date,
    content: row.content,
    extraActivities: row.extra_activities,
    imageUris: JSON.parse(row.image_uris),
    claudeResponse: row.claude_response,
    createdAt: row.created_at
  }
}

// saves claude's response to an existing log
export const updateClaudeResponse = (
  logId: string,
  claudeResponse: string
): void => {
  const db = getDatabase()

  db.runSync(
    `UPDATE daily_logs SET claude_response = ? WHERE id = ?`,
    [claudeResponse, logId]
  )
}

// updates image uris after user adds or removes photos
export const updateLogImages = (
  logId: string,
  imageUris: string[]
): void => {
  const db = getDatabase()

  db.runSync(
    `UPDATE daily_logs SET image_uris = ? WHERE id = ?`,
    [JSON.stringify(imageUris), logId]
  )
}

// deletes a single log
export const deleteLog = (id: string): void => {
  const db = getDatabase()

  db.runSync(`DELETE FROM daily_logs WHERE id = ?`, [id])
}

// fetches all unique dates that have logs — used for calendar reflect view
export const getDatesWithLogs = (): string[] => {
  const db = getDatabase()

  const rows = db.getAllSync<{ log_date: string }>(
    `SELECT DISTINCT log_date FROM daily_logs ORDER BY log_date DESC`
  )

  return rows.map(row => row.log_date)
}
