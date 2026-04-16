"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Wrench } from "lucide-react";

export default function CustomerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let users = JSON.parse(localStorage.getItem("customers") || "[]");

      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!user) throw new Error("Invalid Email or Password");

      localStorage.setItem("currentCustomer", JSON.stringify(user));
      router.push("/dashboard/customer");
    } catch (err) {
      setError((err as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div>{error}</div>}

        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button type="submit">
          {isLoading ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
}