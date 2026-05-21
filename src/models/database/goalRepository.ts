import { getDatabase } from './database'
import { Goal, GoalStatus } from '../types/Goal'

// generates a simple unique id
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// creates a new goal in the database
export const createGoal = (
  title: string,
  description: string,
  targetDate: string
): Goal => {
  const db = getDatabase()
  const id = generateId()
  const createdAt = new Date().toISOString()

  db.runSync(
    `INSERT INTO goals (id, title, description, target_date, status, achieved_at, created_at)
     VALUES (?, ?, ?, ?, 'active', NULL, ?)`,
    [id, title, description, targetDate, createdAt]
  )

  return {
    id,
    title,
    description,
    targetDate,
    status: 'active',
    achievedAt: null,
    createdAt
  }
}

// fetches all goals ordered by most recently created
export const getAllGoals = (): Goal[] => {
  const db = getDatabase()

  const rows = db.getAllSync<{
    id: string
    title: string
    description: string
    target_date: string
    status: GoalStatus
    achieved_at: string | null
    created_at: string
  }>(`SELECT * FROM goals ORDER BY created_at DESC`)

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    targetDate: row.target_date,
    status: row.status,
    achievedAt: row.achieved_at,
    createdAt: row.created_at
  }))
}

// fetches only active goals
export const getActiveGoals = (): Goal[] => {
  const db = getDatabase()

  const rows = db.getAllSync<{
    id: string
    title: string
    description: string
    target_date: string
    status: GoalStatus
    achieved_at: string | null
    created_at: string
  }>(`SELECT * FROM goals WHERE status = 'active' ORDER BY created_at DESC`)

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    targetDate: row.target_date,
    status: row.status,
    achievedAt: row.achieved_at,
    createdAt: row.created_at
  }))
}

// fetches a single goal by id
export const getGoalById = (id: string): Goal | null => {
  const db = getDatabase()

  const row = db.getFirstSync<{
    id: string
    title: string
    description: string
    target_date: string
    status: GoalStatus
    achieved_at: string | null
    created_at: string
  }>(`SELECT * FROM goals WHERE id = ?`, [id])

  if (!row) return null

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetDate: row.target_date,
    status: row.status,
    achievedAt: row.achieved_at,
    createdAt: row.created_at
  }
}

// updates goal title, description and target date
export const updateGoal = (
  id: string,
  title: string,
  description: string,
  targetDate: string
): void => {
  const db = getDatabase()

  db.runSync(
    `UPDATE goals SET title = ?, description = ?, target_date = ? WHERE id = ?`,
    [title, description, targetDate, id]
  )
}

// marks a goal as achieved
export const markGoalAsAchieved = (id: string): void => {
  const db = getDatabase()
  const achievedAt = new Date().toISOString()

  db.runSync(
    `UPDATE goals SET status = 'achieved', achieved_at = ? WHERE id = ?`,
    [achievedAt, id]
  )
}

// pauses an active goal
export const pauseGoal = (id: string): void => {
  const db = getDatabase()

  db.runSync(
    `UPDATE goals SET status = 'paused' WHERE id = ?`,
    [id]
  )
}

// resumes a paused goal
export const resumeGoal = (id: string): void => {
  const db = getDatabase()

  db.runSync(
    `UPDATE goals SET status = 'active' WHERE id = ?`,
    [id]
  )
}

// permanently deletes a goal and all its logs (CASCADE handles logs)
export const deleteGoal = (id: string): void => {
  const db = getDatabase()

  db.runSync(`DELETE FROM goals WHERE id = ?`, [id])
}
