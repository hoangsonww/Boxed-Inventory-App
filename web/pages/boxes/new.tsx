"use client";

import React from "react";
import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner"; // <-- Sonner
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// shadcn Form primitives
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { createBox } from "@/supabase/queries/boxes";

const boxSchema = z.object({
  name: z.string().min(1, "Box name is required").max(50),
  location: z.string().max(100).optional(),
  status: z.enum(["unpacked", "packed", "in_transit"]),
});

type BoxFormValues = z.infer<typeof boxSchema>;

export default function NewBoxPage() {
  const router = useRouter();
  const session = useSession();

  const form = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema),
    defaultValues: { name: "", location: "", status: "unpacked" },
  });

  const onSubmit = async (values: BoxFormValues) => {
    if (!session) {
      toast.error("You must be signed in to create a box.");
      return;
    }

    try {
      const box = await createBox({
        owner_profile_id: session.user.id,
        ...values,
      });
      toast.success("Box created!");
      router.push(`/boxes/${box.id}`);
    } catch (err: any) {
      toast.error("Failed to create box. Please try again.");
      console.error("createBox error:", err);
    }
  };

  if (!session) {
    return (
      <p className="text-center text-muted-foreground">
        Please sign in to continue.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Box</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <CardContent className="space-y-6 pt-0">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name / Label</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Box #3 or Closet Bin"
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name helps you identify it quickly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Field */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Under Bed, Storage Unit, etc."
                      />
                    </FormControl>
                    <FormDescription>
                      Helps with sorting & filters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpacked">Unpacked</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      “Packed” when ready, “In Transit” while moving.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Box"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
