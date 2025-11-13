'use client';
import React from 'react';
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

export const AddFarmerModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10 w-full sm:w-auto">Add New Farmer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form>
          <form>
            <DialogHeader>
              <DialogTitle>Add New Farmer</DialogTitle>
              <DialogDescription>
                Enter the farmer details to register them quickly
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 mt-6">
              <FormField
                name="accountNumber"
                render={() => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter account number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="name"
                render={() => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farmer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="mobileNumber"
                render={() => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter 10-digit mobile number" maxLength={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="address"
                render={() => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" />
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
              <Button type="submit">Add Farmer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
