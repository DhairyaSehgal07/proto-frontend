'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { storeAdminSignInSchema } from '@/schemas/storeAdminSignIn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { z } from 'zod';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

type StoreAdminSignInForm = z.infer<typeof storeAdminSignInSchema>;

export function SignIn() {
  const form = useForm<StoreAdminSignInForm>({
    resolver: zodResolver(storeAdminSignInSchema),
    defaultValues: {
      mobileNumber: '',
      password: '',
    },
  });

  return (
    <Card className="max-w-sm mx-auto mt-12 border border-border shadow-sm">
      <CardHeader className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            {/* Mobile Number */}
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 10-digit mobile number" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don’t have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:text-primary/90 font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
