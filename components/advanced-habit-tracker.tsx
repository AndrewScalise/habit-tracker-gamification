'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, X, Award, Trophy, UserPlus, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Habit {
  id: number
  name: string
  completed: boolean
  streak: number
  lastCompleted: string | null
}

interface Achievement {
  id: number
  name: string
  description: string
  unlocked: boolean
}

interface User {
  id: number
  name: string
  score: number
  level: number
  habits: Habit[]
  achievements: Achievement[]
  friends: number[]
}

interface DailyChallenge {
  id: number
  description: string
  completed: boolean
}

const LEVELS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]

const INITIAL_ACHIEVEMENTS = [
  { id: 1, name: 'Habit Master', description: 'Complete 5 habits', unlocked: false },
  { id: 2, name: 'Streak Keeper', description: 'Maintain a 7-day streak', unlocked: false },
  { id: 3, name: 'Challenge Accepted', description: 'Complete 3 daily challenges', unlocked: false },
  { id: 4, name: 'Social Butterfly', description: 'Add 3 friends', unlocked: false },
  { id: 5, name: 'Overachiever', description: 'Reach level 5', unlocked: false },
]

const generateDailyChallenge = (): DailyChallenge => {
  const challenges = [
    'Complete all your habits today',
    'Add a new habit to your list',
    'Achieve a 3-day streak on any habit',
    'Complete your most difficult habit first',
    'Invite a friend to join the app',
  ]
  return {
    id: Date.now(),
    description: challenges[Math.floor(Math.random() * challenges.length)],
    completed: false,
  }
}

export function AdvancedHabitTrackerComponent() {
  const [user, setUser] = useState<User | null>(null)
  const [newHabit, setNewHabit] = useState('')
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(generateDailyChallenge())
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [showLogin, setShowLogin] = useState(true)
  const [loginName, setLoginName] = useState('')
  const [friendName, setFriendName] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('habitUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setShowLogin(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('habitUser', JSON.stringify(user))
    }
  }, [user])

  useEffect(() => {
    if (user) {
      const newLevel = LEVELS.findIndex(threshold => user.score < threshold)
      if (newLevel !== user.level) {
        setUser(prevUser => ({
          ...prevUser!,
          level: newLevel === -1 ? LEVELS.length : newLevel,
        }))
        alert(`Congratulations! You've reached level ${newLevel === -1 ? LEVELS.length : newLevel}!`)
      }
    }
  }, [user?.score])

  useEffect(() => {
    const storedChallenge = localStorage.getItem('dailyChallenge')
    if (storedChallenge) {
      const parsedChallenge = JSON.parse(storedChallenge)
      if (new Date(parsedChallenge.id).toDateString() === new Date().toDateString()) {
        setDailyChallenge(parsedChallenge)
      } else {
        const newChallenge = generateDailyChallenge()
        setDailyChallenge(newChallenge)
        localStorage.setItem('dailyChallenge', JSON.stringify(newChallenge))
      }
    } else {
      const newChallenge = generateDailyChallenge()
      setDailyChallenge(newChallenge)
      localStorage.setItem('dailyChallenge', JSON.stringify(newChallenge))
    }
  }, [])

  const loginUser = () => {
    if (loginName.trim()) {
      const newUser: User = {
        id: Date.now(),
        name: loginName,
        score: 0,
        level: 1,
        habits: [],
        achievements: INITIAL_ACHIEVEMENTS,
        friends: [],
      }
      setUser(newUser)
      setShowLogin(false)
      updateLeaderboard(newUser)
    }
  }

  const addHabit = () => {
    if (newHabit.trim() !== '' && user) {
      const updatedUser = {
        ...user,
        habits: [...user.habits, { id: Date.now(), name: newHabit, completed: false, streak: 0, lastCompleted: null }],
      }
      setUser(updatedUser)
      setNewHabit('')
    }
  }

  const toggleHabit = (id: number) => {
    if (user) {
      const updatedHabits = user.habits.map(habit => {
        if (habit.id === id) {
          const now = new Date()
          const isNextDay = habit.lastCompleted && new Date(habit.lastCompleted).getDate() !== now.getDate()
          const newStreak = habit.completed ? 0 : (isNextDay ? habit.streak + 1 : habit.streak)
          return { 
            ...habit, 
            completed: !habit.completed, 
            streak: newStreak,
            lastCompleted: !habit.completed ? now.toISOString() : habit.lastCompleted
          }
        }
        return habit
      })
      
      const newScore = user.score + (user.habits.find(h => h.id === id)?.completed ? -10 : 10)
      const updatedUser = { ...user, habits: updatedHabits, score: newScore }
      setUser(updatedUser)
      updateAchievements(updatedUser)
      updateLeaderboard(updatedUser)
    }
  }

  const updateAchievements = (updatedUser: User) => {
    const newAchievements = updatedUser.achievements.map(achievement => {
      if (!achievement.unlocked) {
        if (achievement.id === 1 && updatedUser.habits.filter(h => h.completed).length >= 5) {
          return { ...achievement, unlocked: true }
        }
        if (achievement.id === 2 && updatedUser.habits.some(h => h.streak >= 7)) {
          return { ...achievement, unlocked: true }
        }
        if (achievement.id === 3 && updatedUser.score >= 300) {
          return { ...achievement, unlocked: true }
        }
        if (achievement.id === 4 && updatedUser.friends.length >= 3) {
          return { ...achievement, unlocked: true }
        }
        if (achievement.id === 5 && updatedUser.level >= 5) {
          return { ...achievement, unlocked: true }
        }
      }
      return achievement
    })
    setUser({ ...updatedUser, achievements: newAchievements })
  }

  const updateLeaderboard = (updatedUser: User) => {
    const newLeaderboard = [...leaderboard.filter(u => u.id !== updatedUser.id), updatedUser]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
    setLeaderboard(newLeaderboard)
  }

  const completeDailyChallenge = () => {
    if (user) {
      const updatedUser = { ...user, score: user.score + 50 }
      setUser(updatedUser)
      setDailyChallenge({ ...dailyChallenge, completed: true })
      localStorage.setItem('dailyChallenge', JSON.stringify({ ...dailyChallenge, completed: true }))
      updateLeaderboard(updatedUser)
    }
  }

  const addFriend = () => {
    if (user && friendName.trim()) {
      const friendId = Date.now()
      const updatedUser = {
        ...user,
        friends: [...user.friends, friendId],
      }
      setUser(updatedUser)
      setFriendName('')
      updateAchievements(updatedUser)
    }
  }

  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login to Habit Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
              </div>
              <Button onClick={loginUser}>Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Habit Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="habits">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="challenge">Challenge</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            <TabsContent value="habits">
              <div className="mb-4 text-center">
                <p className="text-xl font-semibold">Score: {user?.score}</p>
                <p className="text-lg">Level: {user?.level}</p>
                <Progress 
                  value={((user?.score ?? 0) - LEVELS[user?.level ?? 1 - 1]) / (LEVELS[user?.level ?? 1] - LEVELS[user?.level ?? 1 - 1]) * 100} 
                  className="mt-2" 
                />
              </div>
              <div className="flex mb-4">
                <Input
                  type="text"
                  placeholder="Enter a new habit"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="mr-2"
                />
                <Button onClick={addHabit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {user?.habits.map(habit => (
                  <li key={habit.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                    <div>
                      <span className={habit.completed ? 'line-through' : ''}>{habit.name}</span>
                      <Badge variant="outline" className="ml-2">Streak: {habit.streak}</Badge>
                    </div>
                    <Button
                      variant={habit.completed ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleHabit(habit.id)}
                    >
                      {habit.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="achievements">
              <ul className="space-y-2">
                {user?.achievements.map(achievement => (
                  <li key={achievement.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                    <div>
                      <span className="font-semibold">{achievement.name}</span>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && <Award className="h-6 w-6 text-yellow-500" />}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="challenge">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Daily Challenge</h3>
                <p>{dailyChallenge.description}</p>
                <Button 
                  onClick={completeDailyChallenge} 
                  disabled={dailyChallenge.completed}
                  className="mt-4"
                >
                  {dailyChallenge.completed ? 'Completed' : 'Complete Challenge'}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="leaderboard">
              <ul className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                    <span>{entry.name}</span>
                    <div className="flex items-center">
                      <span className="mr-2">Score: {entry.score}</span>
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    </div>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="social">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ad a Friend</h3>
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Enter friend's name"
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      className="mr-2"
                    />
                    <Button onClick={addFriend}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Friends</h3>
                  <ul className="space-y-2">
                    {user?.friends.map((friendId) => (
                      <li key={friendId} className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarFallback>{friendId.toString().slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>Friend #{friendId}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}