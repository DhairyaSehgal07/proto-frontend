'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { storeAdminFarmerRegisterSchema } from '@/schemas/storeAdminFarmerRegister';
import type { z } from 'zod';
import { useStoreAdminRegisterFarmer } from '@/services/base/store-admin/functions/useRegisterFarmer';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

export const AddFarmerModal = () => {
  const { mutate, isPending } = useStoreAdminRegisterFarmer();
  const fieldsContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof storeAdminFarmerRegisterSchema>>({
    resolver: zodResolver(storeAdminFarmerRegisterSchema),
    mode: 'onChange', // Enable real-time validation as user types
    defaultValues: {
      name: '',
      address: '',
      mobileNumber: '',
      accountNumber: 0,
      password: '',
    },
  });

  const { onKeyDown, containerRef } = useEnterNavigation({
    containerRef: fieldsContainerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter: () => {
      // Submit form when Enter is pressed on last field
      form.handleSubmit(onSubmit)();
    },
  });

  const onSubmit = (values: z.infer<typeof storeAdminFarmerRegisterSchema>) => {
    mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10 w-full sm:w-auto">Add New Farmer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Farmer</DialogTitle>
              <DialogDescription>
                Enter the farmer details to register them quickly
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 mt-6" ref={containerRef as React.RefObject<HTMLDivElement>}>
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter account number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : Number(value));
                        }}
                        value={field.value || ''}
                        onKeyDown={onKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farmer name" {...field} onKeyDown={onKeyDown} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          // Only allow digits, max 10 characters
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          field.onChange(value);
                        }}
                        value={field.value || ''}
                        onKeyDown={onKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} onKeyDown={onKeyDown} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* password is required by your API schema */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        onKeyDown={onKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Farmer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
