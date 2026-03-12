import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { PasswordInput } from '@/components/password-input'
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
import { useLogin, useStaffLogin } from '@/hooks/sign'
import { getStaffRouteTarget } from '@/lib/staff-position'
import { cn } from '@/lib/utils'

const formSchema = z
  .object({
    mode: z.enum(['business', 'staff']),
    email: z.string().optional(),
    password: z.string().optional(),
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
      } else {
        const emailCheck = z.string().email().safeParse(data.email)
        if (!emailCheck.success) {
          ctx.addIssue({
            code: 'custom',
            message: 'Please enter a valid email',
            path: ['email'],
          })
        }
      }

      if (!data.password) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password is required',
          path: ['password'],
        })
      } else if ((data.password || '').length < 7) {
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

type FormValues = z.infer<typeof formSchema>

type AuthUser = Record<string, unknown> & {
  userType?: string
  type?: string
  position?: string | null
}

type AuthResponseBody = {
  token?: string
  user?: unknown
  staff?: unknown
  data?: unknown
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toAuthUser = (value: unknown): AuthUser | null => {
  if (!isRecord(value)) {
    return null
  }

  return value as AuthUser
}

const toAuthResponseBody = (value: unknown): AuthResponseBody | null => {
  if (!isRecord(value)) {
    return null
  }

  return value as AuthResponseBody
}

const parseAuthResponse = (value: unknown) => {
  const root = toAuthResponseBody(value)
  const nested = toAuthResponseBody(root?.data)

  return {
    token: root?.token || nested?.token || null,
    user:
      toAuthUser(root?.user) ||
      toAuthUser(root?.staff) ||
      toAuthUser(nested?.user) ||
      toAuthUser(nested?.staff),
  }
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    isRecord(error) &&
    typeof error.message === 'string' &&
    error.message.length > 0
  ) {
    return error.message
  }

  return 'Login failed'
}

const collectFormErrors = (errors: FieldErrors<FormValues>) => {
  const messages: string[] = []

  for (const value of Object.values(errors)) {
    if (!value || !isRecord(value)) {
      continue
    }

    if (typeof value.message === 'string') {
      messages.push(value.message)
      continue
    }

    if (isRecord(value.types)) {
      messages.push(...Object.values(value.types).map(String))
    }
  }

  return messages
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'business',
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
    },
  })

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')

    if (digits.startsWith('998') && digits.length === 12) {
      return `+${digits}`
    }

    if (digits.length === 9) {
      return `+998${digits}`
    }

    if (digits.length === 12) {
      return `+${digits}`
    }

    return digits ? `+${digits}` : ''
  }

  const navigateByRole = (user: AuthUser | null) => {
    const role = user?.userType || user?.type || null

    if (role === 'STAFF') {
      navigate({
        ...getStaffRouteTarget(user?.position),
        replace: true,
      })
      return
    }

    if (role === 'BUSINESS') {
      navigate({ to: '/business', replace: true })
      return
    }

    if (role === 'ADMIN') {
      navigate({ to: '/admin', replace: true })
      return
    }

    if (role === 'CLIENT') {
      navigate({ to: '/client', replace: true })
      return
    }

    if (redirectTo) {
      window.location.replace(redirectTo)
    }
  }

  const onSubmit = (data: FormValues) => {
    setIsLoading(true)

    if (mode === 'staff') {
      staffLogin(
        {
          fullName: data.fullName || '',
          phoneNumber: normalizePhone(data.phoneNumber || ''),
        },
        {
          onSuccess: (response: unknown) => {
            setIsLoading(false)

            const { token, user } = parseAuthResponse(response)
            const normalizedUser =
              user && !user.userType ? { ...user, userType: 'STAFF' } : user

            if (token) {
              localStorage.setItem('token', token)
            }

            if (normalizedUser) {
              localStorage.setItem('user', JSON.stringify(normalizedUser))
            }

            navigate({
              ...getStaffRouteTarget(normalizedUser?.position),
              replace: true,
            })
          },
          onError: (error: unknown) => {
            setIsLoading(false)
            toast.error(getErrorMessage(error))
          },
        }
      )

      return
    }

    mutateAsync(
      {
        email: data.email || '',
        password: data.password || '',
      },
      {
        onSuccess: (response: unknown) => {
          setIsLoading(false)

          const { token, user } = parseAuthResponse(response)

          if (token) {
            localStorage.setItem('token', token)
          }

          if (user) {
            localStorage.setItem('user', JSON.stringify(user))
          }

          navigateByRole(user)
        },
        onError: (error: unknown) => {
          setIsLoading(false)
          toast.error(getErrorMessage(error))
        },
      }
    )
  }

  const handleModeChange = (next: 'business' | 'staff') => {
    setMode(next)
    form.setValue('mode', next, { shouldValidate: false, shouldDirty: true })
    form.clearErrors()
  }

  const handleSubmitClick = () => {
    toast.message?.(undefined)

    try {
      const onInvalid = (errors: FieldErrors<FormValues>) => {
        const messages = collectFormErrors(errors)

        if (messages.length > 0) {
          toast.error(messages[0])
          return
        }

        toast.error('Validation failed')
      }

      form.handleSubmit(onSubmit, onInvalid)()
    } catch (_error) {
      // ignore
    }
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
        <Button
          type='submit'
          className='mt-2'
          disabled={isLoading}
          onClick={handleSubmitClick}
        >
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
