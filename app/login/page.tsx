"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../components/LoginForm/login-form";
import { Loader, Center } from "@mantine/core";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

useEffect(() => {
  if (!loading && isAuthenticated) {
    console.log("User is authenticated, redirecting...");
    router.replace("/"); // push kante replace production ki better
  }
}, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isAuthenticated) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return <LoginForm />;
}
