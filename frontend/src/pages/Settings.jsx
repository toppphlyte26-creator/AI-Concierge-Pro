import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [baseCcy, setBaseCcy] = useState(user?.base_currency || "USD");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/me", { name, base_currency: baseCcy });
      updateUser({ name: data.name, base_currency: data.base_currency });
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <AppShell title="Settings">
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/80 border-border card-shadow">
          <CardContent className="p-5">
            <div className="font-display font-semibold mb-4">Profile</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled data-testid="settings-email-input" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="settings-name-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Base currency</Label>
                <Select value={baseCcy} onValueChange={setBaseCcy}>
                  <SelectTrigger data-testid="settings-base-currency-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">Dashboard totals convert to this currency.</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={save} disabled={saving} data-testid="settings-save-button">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border card-shadow">
          <CardContent className="p-5">
            <div className="font-display font-semibold mb-2">Session</div>
            <div className="text-xs text-muted-foreground mb-4">Sign out of your account on this device.</div>
            <Button variant="outline" onClick={logout} data-testid="settings-logout-button">Log out</Button>
            <Separator className="my-6" />
            <div className="text-xs text-muted-foreground">
              FinSight — all data is scoped to your account. Powered by Gemini 2.5 Flash for AI features.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}
