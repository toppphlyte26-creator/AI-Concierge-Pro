export const CATEGORIES = [
  "Food & Drink",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Travel",
  "Housing",
  "Education",
  "Personal Care",
  "Salary",
  "Freelance",
  "Investment",
  "Other",
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => !['Salary', 'Freelance', 'Investment'].includes(c)
);

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];

export const CATEGORY_COLORS = {
  "Food & Drink": "hsl(var(--chart-1))",
  Groceries: "hsl(var(--chart-4))",
  Transport: "hsl(var(--chart-2))",
  Shopping: "hsl(var(--chart-3))",
  Entertainment: "hsl(var(--chart-5))",
  "Bills & Utilities": "hsl(199 60% 45%)",
  Health: "hsl(152 60% 55%)",
  Travel: "hsl(280 55% 60%)",
  Housing: "hsl(30 80% 55%)",
  Education: "hsl(215 70% 60%)",
  "Personal Care": "hsl(340 70% 60%)",
  Other: "hsl(220 12% 40%)",
};

export function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || "hsl(220 12% 40%)";
}
