import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <AuthLayout>
      <Card className='bg-background/60 border-none shadow-2xl backdrop-blur-xl'>
        <CardHeader className='space-y-1 pb-6'>
          <div className='flex items-center justify-between'>
            <CardTitle className='from-primary to-primary/60 bg-gradient-to-br bg-clip-text text-3xl font-bold tracking-tight text-transparent'>
              Create Account
            </CardTitle>
          </div>
          <CardDescription className='text-muted-foreground text-base font-medium'>
            Follow the simple steps to set up your restaurant and join us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter className='text-muted-foreground flex flex-wrap items-center justify-center gap-2 pt-2 text-sm'>
          Already have an account?{' '}
          <Link
            to='/sign-in'
            className='text-primary font-semibold underline-offset-4 transition-all hover:underline'
          >
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
