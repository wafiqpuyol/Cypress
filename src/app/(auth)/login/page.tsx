"use client";

import Loader from "@/components/global/Loader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { actionLoginUser } from "@/lib/server-actions/auth-actions";
import { loginFormPayload, loginFormValidator } from "@/lib/validation/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserClient } from '@supabase/ssr';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import Logo from "../../../../public/cypresslogo.svg";

const LoginPage = () => {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
    const { error } = await actionLoginUser(payload);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }
    router.replace('/dashboard');
  };
  const handleOauth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: location.origin + "/auth/callback?next=/dashboard",
      },
    })
    if (error) {
      console.log(error);
      setSubmitError(error.message);
    }
  }
  return (
    <>
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
                  <Input type="email" placeholder="Email" {...field} disabled={isLoading} />
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
                  <Input type="text" placeholder="Password" {...field} disabled={isLoading} />
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
      <Button className="w-[400px] flex gap-x-3" onClick={() => handleOauth()}>
        <FcGoogle size={25} />
        <span>Sign in with google</span>
      </Button>
    </>

  );
};

export default LoginPage;
