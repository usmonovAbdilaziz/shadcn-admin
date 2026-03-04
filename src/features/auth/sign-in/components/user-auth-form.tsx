import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { IconFacebook, IconGithub } from '@/assets/brand-icons';
import { cn } from '@/lib/utils'
import { useLogin, useStaffLogin } from '@/hooks/sign'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    mode: z.enum(['business', 'staff']),
    email: z
      .string()
      .email({
        error: (iss) =>
          iss.input === '' ? 'Please enter your email' : undefined,
      })
      .optional(),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long')
      .optional(),
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'business') {
      if (!data.email) {
        ctx.addIssue({
          code: 'custom',
          message: 'Email is required',
          path: ['email'],
        })
      }
      if (!data.password || data.password.length < 7) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password must be at least 7 characters',
          path: ['password'],
        })
      }
    } else {
      if (!data.fullName) {
        ctx.addIssue({
          code: 'custom',
          message: 'Full name is required',
          path: ['fullName'],
        })
      }
      if (!data.phoneNumber) {
        ctx.addIssue({
          code: 'custom',
          message: 'Phone number is required',
          path: ['phoneNumber'],
        })
      }
    }
  })

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'business' | 'staff'>('business')
  const navigate = useNavigate()
  const { mutateAsync } = useLogin()
  const { mutateAsync: staffLogin } = useStaffLogin()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'business',
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
    },
  })
  useEffect(() => {}, [])

  const normalizePhone = (value: string) => {
    const digits = (value || '').replace(/\D/g, '')
    if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
    if (digits.length === 9) return `+998${digits}`
    if (digits.length === 12) return `+${digits}`
    return digits ? `+${digits}` : ''
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    if (mode === 'staff') {
      const payload = {
        fullName: data.fullName || '',
        phoneNumber: normalizePhone(data.phoneNumber || ''),
      }
      staffLogin(payload, {
        onSuccess: (resp) => {
          setIsLoading(false)
          localStorage.setItem('token', resp.data.token)
          localStorage.setItem('user', JSON.stringify(resp.data.user))
          navigate({ to: '/staff', replace: true })
        },
        onError: (error: any) => {
          setIsLoading(false)
          toast.error(error.message || 'Login failed')
        },
      })
      return
    }

    mutateAsync(
      { email: data.email || '', password: data.password || '' },
      {
        onSuccess: (resp) => {
          setIsLoading(false)
          localStorage.setItem('token', resp.data.token)
          localStorage.setItem('user', JSON.stringify(resp.data.user))
          const user = resp.data.user
          const role = (user.userType || (user as any).type) as string
          if (role === 'STAFF') {
            navigate({ to: '/staff', replace: true })
          } else if (role === 'BUSINESS') {
            navigate({ to: '/business', replace: true })
          } else if (role === 'ADMIN') {
            navigate({ to: '/admin', replace: true })
          } else if (role === 'CLIENT') {
            navigate({ to: '/client', replace: true })
          } else if (redirectTo) {
            navigate({ to: redirectTo as any, replace: true })
          }
        },
        onError: (error: any) => {
          setIsLoading(false)
          toast.error(error.message || 'Login failed')
        },
      }
    )
  }

  const handleModeChange = (next: 'business' | 'staff') => {
    setMode(next)
    form.setValue('mode', next, { shouldValidate: false, shouldDirty: true })
    form.clearErrors()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <div className='mb-2 flex w-full gap-2'>
          <Button
            type='button'
            variant={mode === 'business' ? 'default' : 'outline'}
            onClick={() => handleModeChange('business')}
            disabled={isLoading}
          >
            Business
          </Button>
          <Button
            type='button'
            variant={mode === 'staff' ? 'default' : 'outline'}
            onClick={() => handleModeChange('staff')}
            disabled={isLoading}
          >
            Staff
          </Button>
        </div>

        <input type='hidden' {...form.register('mode')} />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className={mode === 'business' ? '' : 'hidden'}>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem
              className={cn('relative', mode === 'business' ? '' : 'hidden')}
            >
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem className={mode === 'staff' ? '' : 'hidden'}>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phoneNumber'
          render={({ field }) => (
            <FormItem className={mode === 'staff' ? '' : 'hidden'}>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder='+998 90 123 45 67' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}