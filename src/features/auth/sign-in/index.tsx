import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-center text-lg tracking-tight'>
            Sign in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <div className='w-full text-center'>
            Don't have an account?
            <a href='/sign-up' className='text-primary hover:underline'> Sign up</a>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
