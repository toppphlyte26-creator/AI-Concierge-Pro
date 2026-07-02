import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, ScanLine, Receipt, MoreHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES, CURRENCIES, categoryColor } from "@/lib/constants";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Num } from "@/components/Num";
import { TransactionModal } from "@/components/TransactionModal";
import { EmptyState } from "@/components/EmptyState";
import { useNavigate } from "react-router-dom";
import { txAmountToneClass, txTypeBadgeClass } from "@/lib/ui-status";

export default function Transactions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("__all");
  const [currency, setCurrency] = useState("__all");
  const [type, setType] = useState("__all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "__all") params.category = category;
      if (currency !== "__all") params.currency = currency;
      if (type !== "__all") params.type = type;
      const { data } = await api.get("/transactions", { params });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [category, currency, type]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(t =>
      (t.description || "").toLowerCase().includes(q) ||
      (t.merchant || "").toLowerCase().includes(q) ||
      (t.category || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const del = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate("/app/receipt")} className="gap-1.5 hidden sm:inline-flex" data-testid="transactions-scan-button">
        <ScanLine className="h-4 w-4" /> Scan
      </Button>
      <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }} className="gap-1.5" data-testid="transactions-add-button">
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );

  return (
    <AppShell title="Transactions" actions={actions}>
      <Card className="bg-card/80 border-border card-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input placeholder="Search description or merchant…" value={search}
              onChange={(e) => setSearch(e.target.value)} data-testid="transactions-search-input" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="transactions-filter-category-select"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger data-testid="transactions-filter-currency-select"><SelectValue placeholder="Currency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All currencies</SelectItem>
                {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="transactions-filter-type-select"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All types</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        {loading ? (
          <div className="text-sm text-muted-foreground p-6">Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description="Add your first transaction or scan a receipt to get started."
            actionLabel="Add transaction"
            onAction={() => { setEditing(null); setModalOpen(true); }}
            testId="transactions-empty"
          />
        ) : (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>
            <Card className="bg-card/80 border-border card-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <Table data-testid="transactions-table">
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(t => (
                      <TableRow key={t.id} className="border-border hover:bg-white/[0.03]">
                        <TableCell className="num text-sm text-muted-foreground whitespace-nowrap">{formatDate(t.date)}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{t.description}</div>
                          {t.merchant && t.merchant !== t.description && (
                            <div className="text-xs text-muted-foreground">{t.merchant}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5 border-white/10 bg-white/[0.03]">
                            <span className="h-1.5 w-1.5 rounded-full" style={{background: categoryColor(t.category)}} />
                            <span className="text-xs">{t.category}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`num ${txAmountToneClass(t.type)}`}>
                            <Num value={t.amount} currency={t.currency} showPlus={t.type === 'income'} />
                          </div>
                          <div className="text-[10px] text-muted-foreground num">{t.currency}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={txTypeBadgeClass(t.type)}>
                            {t.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`tx-row-actions-${t.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditing(t); setModalOpen(true); }} data-testid={`tx-edit-${t.id}`}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => del(t.id)} className="text-rose-400" data-testid={`tx-delete-${t.id}`}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} initial={editing} onSaved={load} />
    </AppShell>
  );
}
