"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginFormPayload, loginFormValidator } from "@/lib/validation/login";
import Logo from "../../../../public/cypresslogo.svg";
import Loader from "@/components/global/Loader";
import { actionLoginUser } from "@/lib/server-actions/auth-actions";
const LoginPage = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const form = useForm<z.infer<typeof loginFormValidator>>({
    mode: "onChange",
    resolver: zodResolver(loginFormValidator),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit: SubmitHandler<z.infer<typeof loginFormValidator>> = async (
    payload: loginFormPayload
  ) => {
    await actionLoginUser(payload);
    const { error } = await actionLoginUser(payload);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }
    router.replace('/dashboard');
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link
          href="/"
          className="
        w-full
        flex
        justify-left
        items-center"
        >
          <Image src={Logo} alt="cypress Logo" width={50} height={50} />
          <span
            className="font-semibold
        dark:text-white text-4xl first-letter:ml-2"
          >
            cypress.
          </span>
        </Link>
        <FormDescription
          className="
      text-foreground/60"
        >
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>
        <FormField
          disabled={isLoading}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={isLoading}
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="text" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          disabled={isLoading}
        >
          {!isLoading ? "Login" : <Loader />}
        </Button>
        <span className="self-container">
          Dont have an account?{" "}
          <Link href="/signup" className="text-primary">
            Sign Up
          </Link>
        </span>
      </form>
    </Form>
  );
};

export default LoginPage;
