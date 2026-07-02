import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      const next = location.state?.from || "/app";
      navigate(next, { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen aurora noise-overlay flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="font-display text-2xl font-semibold">FinSight</div>
        </div>
        <Card className="bg-card/80 border-border card-shadow">
          <CardContent className="p-6 sm:p-7">
            <div className="mb-6">
              <div className="font-display text-xl font-semibold">Welcome back</div>
              <div className="text-sm text-muted-foreground mt-1">
                Sign in to continue managing your finances.
              </div>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="w-full gap-2" data-testid="login-submit-button">
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
            <div className="mt-5 text-sm text-muted-foreground text-center">
              New here?{' '}
              <Link to="/signup" className="text-primary hover:underline" data-testid="login-goto-signup">Create an account</Link>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" data-testid="login-back-home">← Back to home</Link>
        </div>
      </motion.div>
    </div>
  );
}
