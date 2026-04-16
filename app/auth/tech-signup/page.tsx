"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Wrench } from "lucide-react";

export default function TechSignup() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    tech_id: "",
    password: "",
    name: "",
    phone: "",
    specialization: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get existing technicians
      let users = JSON.parse(localStorage.getItem("technicians") || "[]");

      // Check if already exists
      const exists = users.find((u: any) => u.tech_id === formData.tech_id);
      if (exists) {
        throw new Error("Technician already exists");
      }

      // Add new technician
      users.push(formData);

      // Save list
      localStorage.setItem("technicians", JSON.stringify(users));

      // Save current login
      localStorage.setItem("currentTechnician", JSON.stringify(formData));

      // Redirect
      router.push("/dashboard/technician");
    } catch (err) {
      setError((err as Error).message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AC Tech Pro</h1>
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Technician Sign Up</h2>
          <p className="text-muted-foreground mt-2">
            Join our network of professional AC technicians
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
            <Input name="tech_id" placeholder="TECH-12345" value={formData.tech_id} onChange={handleChange} />
            <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            <Input name="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />
            <Input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} />

            <Button type="submit" className="w-full">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

          </form>

          <div className="mt-6 text-center text-sm">
            <p>
              Already have an account?{" "}
              <Link href="/auth/tech-login" className="text-primary">
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}