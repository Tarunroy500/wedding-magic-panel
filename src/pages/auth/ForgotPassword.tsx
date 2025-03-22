
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your API to send a password reset email
      console.log('Password reset requested for:', values.email);
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for instructions to reset your password',
      });
      
      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: 'Failed to send reset email',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      description={
        isSubmitted
          ? "Check your email for a link to reset your password"
          : "Enter your email address and we'll send you a link to reset your password"
      }
      footer={
        <div>
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to login
          </Link>
        </div>
      }
    >
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="bg-muted/30 text-foreground p-4 rounded-md">
            <p>We've sent a password reset link to your email address.</p>
          </div>
          <Button
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            Send again
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
                      type="email" 
                      autoComplete="email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        </Form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
