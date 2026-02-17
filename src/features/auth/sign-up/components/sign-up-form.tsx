import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignUpStatus } from '@/types/sign'
import {
  User,
  Store,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { useSignUp } from '@/hooks/sign'
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
import { MapModal } from './map-modal'
import { useNavigate } from '@tanstack/react-router'

const signUpSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phoneNumber: z.string().min(1, 'Please enter your phone number'),
  fullName: z.string().min(1, 'Please enter your full name'),
  profilePhoto: z.string().min(1, 'Please enter your profile photo (URL)'),
  businessName: z.string().min(1, 'Please enter your business name'),
  businessType: z.string().min(1, 'Please enter your business type'),
  description: z.string().min(1, 'Please enter your description'),
  address: z.string().min(1, 'Please enter your address district'),
  city: z.string().min(1, 'Please enter your city'),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().min(1, 'Please enter your business phone'),
})

const formSchema = signUpSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  }
)

type SignUpFormValues = z.infer<typeof signUpSchema>

const STEPS = [
  { id: 1, title: 'Account', icon: User },
  { id: 2, title: 'Business', icon: Store },
  { id: 3, title: 'Location', icon: MapPin },
]

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync } = useSignUp()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      profilePhoto: '',
      businessName: '',
      businessType: '',
      description: '',
      address: '',
      city: '',
      latitude: 41.311081,
      longitude: 69.240562,
      phone: '',
    },
    mode: 'onTouched',
  })

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignUpFormValues)[] = []

    if (step === 1) {
      fieldsToValidate = [
        'fullName',
        'email',
        'password',
        'confirmPassword',
        'phoneNumber',
      ]
    } else if (step === 2) {
      fieldsToValidate = [
        'businessName',
        'businessType',
        'description',
        'profilePhoto',
        'phone',
      ]
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  function onSubmit(values: SignUpFormValues) {
    const { confirmPassword, ...data } = values
    setIsLoading(true)

    mutateAsync(data as SignUpStatus, {
      onSuccess: (responce) => {
        setIsLoading(false)
        toast.success('Sign up successfully!')
        localStorage.setItem('token', responce.data.token)
        localStorage.setItem('user', JSON.stringify(responce.data.user))
        navigate({to: '/'})
      },
      onError: (err: any) => {
        setIsLoading(false)
        toast.error(err.message || 'Sign up failed')
      },
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Indicator */}
      <div className='mb-8 flex items-center justify-between px-2'>
        {STEPS.map((s, idx) => (
          <div key={s.id} className='relative flex flex-col items-center gap-2'>
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                step >= s.id
                  ? 'bg-primary border-primary text-primary-foreground shadow-primary/20 shadow-lg'
                  : 'bg-background border-muted text-muted-foreground'
              )}
            >
              {step > s.id ? (
                <Check className='size-5' />
              ) : (
                <s.icon className='size-5' />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-bold tracking-wider uppercase transition-colors duration-300',
                step >= s.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {s.title}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'bg-muted absolute top-5 left-[2.5rem] h-[2px] w-[calc(100vw/5)] max-w-[80px] transition-all duration-300',
                  step > s.id && 'bg-primary'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
          {...props}
        >
          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className='animate-in fade-in slide-in-from-right-4 space-y-4 duration-500'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder='John Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='name@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='********' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='********' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='+998 (90) 123-45-67' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className='animate-in fade-in slide-in-from-right-4 space-y-4 duration-500'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='businessName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder='My Great Restaurant' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='businessType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Cafe, Restaurant, etc.'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+998 (71) 123-45-67' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='profilePhoto'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Logo/Photo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/logo.jpg'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Short description of your business'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Location Info */}
          {step === 3 && (
            <div className='animate-in fade-in slide-in-from-right-4 space-y-4 duration-500'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Chilonzor, Yunusobod...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder='Tashkent' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='pt-2'>
                <FormField
                  control={form.control}
                  name='latitude'
                  render={() => (
                    <FormItem>
                      <FormLabel>Pinpoint Location</FormLabel>
                      <FormControl>
                        <MapModal
                          value={{
                            lat: form.watch('latitude'),
                            lng: form.watch('longitude'),
                          }}
                          onChange={(coords) => {
                            form.setValue('latitude', coords.lat)
                            form.setValue('longitude', coords.lng)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className='flex gap-3 pt-6'>
            {step > 1 && (
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={prevStep}
              >
                <ChevronLeft className='mr-2 size-4' /> Previous
              </Button>
            )}

            {step < 3 ? (
              <Button type='button' className='flex-1' onClick={nextStep}>
                Next <ChevronRight className='ml-2 size-4' />
              </Button>
            ) : (
              <Button type='submit' className='flex-1' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='mr-2 size-4 animate-spin' />
                ) : (
                  <Check className='mr-2 size-4' />
                )}
                Create Account
              </Button>
            )}
          </div>

          {step === 1 && (
            <>
              <div className='relative my-4'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background text-muted-foreground px-2'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  disabled={isLoading}
                >
                  <IconGithub className='mr-2 h-4 w-4' /> GitHub
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  disabled={isLoading}
                >
                  <IconFacebook className='mr-2 h-4 w-4' /> Facebook
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  )
}
