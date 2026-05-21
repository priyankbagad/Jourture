import { useState, useCallback } from 'react'
import { DailyLog } from '../models/types/DailyLog'
import { Goal } from '../models/types/Goal'
import {
  createLog,
  getLogsByGoalId,
  getLogById,
  getLogsByDate,
  getTodayLogForGoal,
  updateClaudeResponse,
  updateLogImages,
  deleteLog,
  getDatesWithLogs
} from '../models/database/logRepository'

interface LogState {
  logs: DailyLog[]
  selectedLog: DailyLog | null
  todayLog: DailyLog | null
  isLoading: boolean
  isClaudeLoading: boolean
  claudeStreamedText: string
  error: string | null
  datesWithLogs: string[]
}

export const useLogViewModel = () => {
  const [state, setState] = useState<LogState>({
    logs: [],
    selectedLog: null,
    todayLog: null,
    isLoading: false,
    isClaudeLoading: false,
    claudeStreamedText: '',
    error: null,
    datesWithLogs: []
  })

  const setLoading = (isLoading: boolean) =>
    setState(prev => ({ ...prev, isLoading }))

  const setError = (error: string) =>
    setState(prev => ({ ...prev, error }))

  // fetches all logs for a specific goal
  const fetchLogsByGoal = useCallback((goalId: string) => {
    try {
      setLoading(true)
      const logs = getLogsByGoalId(goalId)
      setState(prev => ({ ...prev, logs, isLoading: false }))
    } catch (e) {
      setError('Failed to fetch logs')
      setLoading(false)
    }
  }, [])

  // fetches a single log by id
  const fetchLogById = useCallback((id: string) => {
    try {
      setLoading(true)
      const selectedLog = getLogById(id)
      setState(prev => ({ ...prev, selectedLog, isLoading: false }))
    } catch (e) {
      setError('Failed to fetch log')
      setLoading(false)
    }
  }, [])

  // checks if user already logged today for a specific goal
  const fetchTodayLog = useCallback((goalId: string) => {
    try {
      const todayLog = getTodayLogForGoal(goalId)
      setState(prev => ({ ...prev, todayLog }))
    } catch (e) {
      setError('Failed to fetch today log')
    }
  }, [])

  // fetches all logs for a specific date — used in reflect/calendar view
  const fetchLogsByDate = useCallback((date: string) => {
    try {
      setLoading(true)
      const logs = getLogsByDate(date)
      setState(prev => ({ ...prev, logs, isLoading: false }))
    } catch (e) {
      setError('Failed to fetch logs for date')
      setLoading(false)
    }
  }, [])

  // fetches all dates that have at least one log — for calendar highlights
  const fetchDatesWithLogs = useCallback(() => {
    try {
      const datesWithLogs = getDatesWithLogs()
      setState(prev => ({ ...prev, datesWithLogs }))
    } catch (e) {
      setError('Failed to fetch dates')
    }
  }, [])

  // THIS IS THE MOST IMPORTANT FUNCTION — saves log then calls claude
  const submitLog = useCallback(async (
    goal: Goal,
    content: string,
    extraActivities: string | null,
    imageUris: string[],
    apiKey: string
  ) => {
    try {
      // step 1 — save to SQLite immediately before anything else
      const newLog = createLog(goal.id, content, extraActivities, imageUris)

      // step 2 — add to state so screen shows it right away
      setState(prev => ({
        ...prev,
        logs: [newLog, ...prev.logs],
        todayLog: newLog,
        isClaudeLoading: true,
        claudeStreamedText: ''
      }))

      // step 3 — build the prompt with full context
      const daysLeft = Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date().getTime())
        / (1000 * 60 * 60 * 24)
      )

      const prompt = `
You are a warm, personal coach for someone working toward their goal.

Goal: ${goal.title}
Description: ${goal.description}
Target date: ${goal.targetDate} (${daysLeft} days from now)

What they did today:
${content}

${extraActivities ? `Extra activities: ${extraActivities}` : ''}

In 3-4 sentences maximum:
1. Acknowledge specifically what they did today
2. Connect it to their bigger goal
3. Motivate them warmly for tomorrow

Be personal, genuine, and concise. No bullet points. No emojis. Just warm human words.
      `.trim()

      // step 4 — call claude api with streaming
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'messages-2023-12-15'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 300,
          stream: true,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Claude API call failed')
      }

      // step 5 — read the streamed response chunk by chunk
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.replace('data: ', '').trim()
              if (data === '[DONE]') break

              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content_block_delta') {
                  const text = parsed.delta?.text || ''
                  fullResponse += text

                  // update state with each new chunk so text appears word by word
                  setState(prev => ({
                    ...prev,
                    claudeStreamedText: prev.claudeStreamedText + text
                  }))
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      }

      // step 6 — save the full response to SQLite
      updateClaudeResponse(newLog.id, fullResponse)

      // step 7 — update state with final response
      setState(prev => ({
        ...prev,
        logs: prev.logs.map(l =>
          l.id === newLog.id
            ? { ...l, claudeResponse: fullResponse }
            : l
        ),
        todayLog: { ...newLog, claudeResponse: fullResponse },
        isClaudeLoading: false
      }))

    } catch (e) {
      setError('Failed to submit log')
      setState(prev => ({ ...prev, isClaudeLoading: false }))
    }
  }, [])

  const addImagesToLog = useCallback((logId: string, imageUris: string[]) => {
    try {
      updateLogImages(logId, imageUris)
      setState(prev => ({
        ...prev,
        logs: prev.logs.map(l =>
          l.id === logId ? { ...l, imageUris } : l
        )
      }))
    } catch (e) {
      setError('Failed to update images')
    }
  }, [])

  const removeLog = useCallback((id: string) => {
    try {
      deleteLog(id)
      setState(prev => ({
        ...prev,
        logs: prev.logs.filter(l => l.id !== id),
        todayLog: prev.todayLog?.id === id ? null : prev.todayLog
      }))
    } catch (e) {
      setError('Failed to delete log')
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    fetchLogsByGoal,
    fetchLogById,
    fetchTodayLog,
    fetchLogsByDate,
    fetchDatesWithLogs,
    submitLog,
    addImagesToLog,
    removeLog,
    clearError
  }
}
