'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { PackageOpen, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, session } = useAuth()
  const { toast } = useToast()

  // Redirect if already authenticated
  useEffect(() => {
    if (user && session) {
      router.push('/dashboard')
    }
  }, [user, session, router])

  // Show error from URL params if exists
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      toast({
        title: "Authentication Error",
        description: urlError,
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.error || 'Login failed',
          variant: "destructive",
        })
        return
      }

      if (data.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
        })
        // Force a hard redirect to ensure cookies are loaded
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        toast({
          title: "Login Failed",
          description: data.error || 'Login failed',
          variant: "destructive",
        })
      }

    } catch (error) {
      toast({
        title: "Error",
        description: 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      })
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-emerald-500/10">
            <PackageOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Supplier Portal</CardTitle>
          <CardDescription>
            Sign in to manage your supplier account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@taant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </Label>
              </div>

              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Don't have a supplier account?{' '}
            <Link href="/register" className="text-emerald-600 hover:underline">
              Request supplier access
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}