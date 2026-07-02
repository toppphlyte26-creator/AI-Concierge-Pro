import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanLine,
  Sparkles,
  PiggyBank,
  Target,
  CalendarClock,
  Wallet,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Num } from "@/components/Num";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <header className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-[1280px] mx-auto">
        <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">FinSight</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm" data-testid="landing-login-button">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" data-testid="landing-hero-start-free-button">Start free</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative aurora noise-overlay">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered receipts & auto-categorization
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              Your finances,
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                intelligently in view.
              </span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Track spending, scan receipts with AI, manage budgets and recurring bills, and
              chase savings goals — across multiple currencies. Modern, dark, and precise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="gap-2" data-testid="landing-cta-signup">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" data-testid="landing-cta-login">
                  I have an account
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex gap-6 text-xs text-muted-foreground">
              <div>✨ AI receipt scan</div>
              <div>💱 5 currencies</div>
              <div>🔒 JWT secured</div>
            </div>
          </motion.div>

          {/* Product mock stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card className="col-span-2 bg-card/80 border-border card-shadow noise-overlay">
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground">This month • USD</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Net</div>
                      <div className="num text-3xl font-semibold text-primary"><Num value={2342.18} /></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Savings rate</div>
                      <div className="num text-2xl font-semibold">28.4%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border card-shadow">
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Income</div>
                  <div className="num mt-1 text-lg font-semibold text-emerald-400"><Num value={8234.5} /></div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border card-shadow">
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Expenses</div>
                  <div className="num mt-1 text-lg font-semibold text-rose-400"><Num value={5892.32} /></div>
                </CardContent>
              </Card>
              <Card className="col-span-2 glass border-border card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                    <ScanLine className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Blue Bottle Coffee</div>
                    <div className="text-xs text-muted-foreground">Food & Drink • Extracted from receipt</div>
                  </div>
                  <div className="num text-lg font-semibold"><Num value={24.47} /></div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: ScanLine, title: "AI Receipt Scan", body: "Snap a photo. Gemini extracts merchant, total, currency, date & category in seconds." },
            { icon: Sparkles, title: "Smart Auto-Categorization", body: "Leave category blank. AI suggests it based on the description — always editable." },
            { icon: PiggyBank, title: "Budgets", body: "Set monthly caps per category and watch progress with color-coded rings." },
            { icon: CalendarClock, title: "Recurring Bills", body: "Never miss Netflix, rent, or utilities. Upcoming bills right on the dashboard." },
            { icon: Target, title: "Savings Goals", body: "Track progress toward emergency funds, trips, or that new laptop." },
            { icon: Wallet, title: "Multi-currency", body: "USD, EUR, GBP, INR, JPY — aggregate everything into your base currency." },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="bg-card/70 border-border card-shadow">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-display text-base font-semibold">{title}</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust / Security */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="bg-card/60 border-border card-shadow">
          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-semibold">Secure by design</div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Passwords are hashed with bcrypt. Sessions use JWTs. Your data stays scoped to
                your account — only you can see it.
              </p>
            </div>
            <Link to="/signup">
              <Button size="lg" data-testid="landing-cta-signup-bottom">Create your account</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} FinSight</div>
          <div>Built with FastAPI, React & Gemini 2.5 Flash</div>
        </div>
      </footer>
    </div>
  );
}
