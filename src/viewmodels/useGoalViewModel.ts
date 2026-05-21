import { useState, useCallback } from 'react'
import { Goal } from '../models/types/Goal'
import {
  createGoal,
  getAllGoals,
  getActiveGoals,
  getGoalById,
  updateGoal,
  markGoalAsAchieved,
  pauseGoal,
  resumeGoal,
  deleteGoal
} from '../models/database/goalRepository'

interface GoalState {
  goals: Goal[]
  activeGoals: Goal[]
  selectedGoal: Goal | null
  isLoading: boolean
  error: string | null
}

export const useGoalViewModel = () => {
  const [state, setState] = useState<GoalState>({
    goals: [],
    activeGoals: [],
    selectedGoal: null,
    isLoading: false,
    error: null
  })

  const setLoading = (isLoading: boolean) =>
    setState(prev => ({ ...prev, isLoading }))

  const setError = (error: string) =>
    setState(prev => ({ ...prev, error }))

  const fetchAllGoals = useCallback(() => {
    try {
      setLoading(true)
      const goals = getAllGoals()
      setState(prev => ({ ...prev, goals, isLoading: false }))
    } catch (e) {
      setError('Failed to fetch goals')
      setLoading(false)
    }
  }, [])

  const fetchActiveGoals = useCallback(() => {
    try {
      setLoading(true)
      const activeGoals = getActiveGoals()
      setState(prev => ({ ...prev, activeGoals, isLoading: false }))
    } catch (e) {
      setError('Failed to fetch active goals')
      setLoading(false)
    }
  }, [])

  const fetchGoalById = useCallback((id: string) => {
    try {
      setLoading(true)
      const selectedGoal = getGoalById(id)
      setState(prev => ({ ...prev, selectedGoal, isLoading: false }))
    } catch (e) {
      setError('Failed to fetch goal')
      setLoading(false)
    }
  }, [])

  const addGoal = useCallback((
    title: string,
    description: string,
    targetDate: string
  ): Goal | null => {
    try {
      const newGoal = createGoal(title, description, targetDate)
      setState(prev => ({
        ...prev,
        goals: [newGoal, ...prev.goals],
        activeGoals: [newGoal, ...prev.activeGoals]
      }))
      return newGoal
    } catch (e) {
      setError('Failed to create goal')
      return null
    }
  }, [])

  const editGoal = useCallback((
    id: string,
    title: string,
    description: string,
    targetDate: string
  ) => {
    try {
      updateGoal(id, title, description, targetDate)
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === id ? { ...g, title, description, targetDate } : g
        ),
        activeGoals: prev.activeGoals.map(g =>
          g.id === id ? { ...g, title, description, targetDate } : g
        )
      }))
    } catch (e) {
      setError('Failed to update goal')
    }
  }, [])

  const achieveGoal = useCallback((id: string) => {
    try {
      markGoalAsAchieved(id)
      const achievedAt = new Date().toISOString()
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === id ? { ...g, status: 'achieved', achievedAt } : g
        ),
        activeGoals: prev.activeGoals.filter(g => g.id !== id)
      }))
    } catch (e) {
      setError('Failed to mark goal as achieved')
    }
  }, [])

  const pauseGoalById = useCallback((id: string) => {
    try {
      pauseGoal(id)
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === id ? { ...g, status: 'paused' } : g
        ),
        activeGoals: prev.activeGoals.filter(g => g.id !== id)
      }))
    } catch (e) {
      setError('Failed to pause goal')
    }
  }, [])

  const resumeGoalById = useCallback((id: string) => {
    try {
      resumeGoal(id)
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === id ? { ...g, status: 'active' } : g
        ),
        activeGoals: prev.activeGoals.filter(g => g.id !== id)
      }))
      fetchActiveGoals()
    } catch (e) {
      setError('Failed to resume goal')
    }
  }, [])

  const removeGoal = useCallback((id: string) => {
    try {
      deleteGoal(id)
      setState(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id),
        activeGoals: prev.activeGoals.filter(g => g.id !== id)
      }))
    } catch (e) {
      setError('Failed to delete goal')
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    fetchAllGoals,
    fetchActiveGoals,
    fetchGoalById,
    addGoal,
    editGoal,
    achieveGoal,
    pauseGoalById,
    resumeGoalById,
    removeGoal,
    clearError
  }
}
