{
  "product": {
    "name": "FinSight",
    "tagline": "AI-powered personal finance tracker",
    "brand_attributes": [
      "premium",
      "dark-first",
      "data-forward",
      "calm confidence",
      "precision typography",
      "subtle depth (glass, not glow)",
      "fast + responsive"
    ],
    "design_fusion_inspiration": {
      "layout_principles": [
        "Mercury: trust-first clarity + ‘lead with one number’ KPI hierarchy",
        "Linear: dense-but-readable tables, crisp borders, restrained color",
        "Copilot Money: warm-navy dark canvas + bright data accents"
      ],
      "interaction_principles": [
        "Micro-interactions on every actionable control (hover, press, focus)",
        "Motion communicates state changes (filters, modals, save success)",
        "Charts feel ‘instrument-grade’: minimal chrome, precise labels"
      ]
    }
  },

  "global_tokens": {
    "notes": [
      "Implement tokens via CSS variables in /app/frontend/src/index.css under .dark (dark is primary).",
      "Avoid pure black; use warm navy/charcoal to reduce eye strain.",
      "Numbers must use tabular figures everywhere (tables, KPIs, charts, tooltips)."
    ],

    "typography": {
      "google_fonts": [
        {
          "family": "Space Grotesk",
          "weights": ["400", "500", "600", "700"],
          "usage": "UI headings + navigation"
        },
        {
          "family": "IBM Plex Sans",
          "weights": ["400", "500", "600"],
          "usage": "Body text + forms"
        },
        {
          "family": "IBM Plex Mono",
          "weights": ["400", "500", "600"],
          "usage": "Currency + KPIs + tables + chart ticks/tooltips (tabular figures)"
        }
      ],
      "tailwind_font_setup": {
        "instructions": [
          "Add <link> tags in public/index.html for the 3 Google Fonts.",
          "In tailwind.config.js extend fontFamily: { sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui'], display: ['Space Grotesk', 'ui-sans-serif'], mono: ['IBM Plex Mono', 'ui-monospace'] }",
          "Apply font-display to headings (h1/h2/nav), font-sans to body, font-mono to numeric elements.",
          "Add `font-variant-numeric: tabular-nums;` to `.num` utility class (see CSS utilities below)."
        ]
      },
      "type_scale": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight",
        "h2": "text-base md:text-lg font-sans text-muted-foreground",
        "section_title": "text-sm font-display font-semibold tracking-wide text-foreground/90",
        "body": "text-sm md:text-base font-sans text-foreground/85 leading-relaxed",
        "caption": "text-xs font-sans text-muted-foreground",
        "kpi_number": "font-mono tabular-nums text-2xl md:text-3xl font-semibold tracking-tight",
        "table_number": "font-mono tabular-nums text-sm"
      }
    },

    "color_system": {
      "mode": "dark-first",
      "palette": {
        "bg": {
          "canvas": "hsl(222 28% 7%)  /* #0B0F17 */",
          "canvas_2": "hsl(222 26% 9%)  /* #0E1420 */",
          "surface": "hsl(222 22% 11%)  /* #121A28 */",
          "surface_2": "hsl(222 20% 13%)  /* #162033 */",
          "popover": "hsl(222 22% 12%)",
          "recessed": "hsl(222 30% 6%)"
        },
        "text": {
          "primary": "hsl(210 40% 96%)",
          "secondary": "hsl(215 20% 78%)",
          "muted": "hsl(215 16% 65%)",
          "disabled": "hsl(215 12% 52%)"
        },
        "borders": {
          "subtle": "hsl(220 18% 20%)",
          "strong": "hsl(220 18% 26%)"
        },
        "brand": {
          "accent": "hsl(168 78% 45%)  /* teal-mint (primary action) */",
          "accent_2": "hsl(199 84% 55%)  /* ocean blue (secondary accent) */",
          "accent_soft": "hsl(168 60% 18%)",
          "ring": "hsl(168 78% 45%)"
        },
        "semantic": {
          "success": "hsl(152 72% 45%)",
          "danger": "hsl(6 78% 58%)",
          "warning": "hsl(42 92% 58%)",
          "info": "hsl(199 84% 55%)"
        }
      },
      "shadcn_css_variables_mapping": {
        "instructions": [
          "Replace the default :root and .dark tokens in /app/frontend/src/index.css with the values below.",
          "Keep charts as CSS vars too (for Recharts)."
        ],
        "dark": {
          "--background": "222 28% 7%",
          "--foreground": "210 40% 96%",
          "--card": "222 22% 11%",
          "--card-foreground": "210 40% 96%",
          "--popover": "222 22% 12%",
          "--popover-foreground": "210 40% 96%",
          "--primary": "168 78% 45%",
          "--primary-foreground": "222 28% 7%",
          "--secondary": "222 20% 13%",
          "--secondary-foreground": "210 40% 96%",
          "--muted": "222 18% 14%",
          "--muted-foreground": "215 16% 65%",
          "--accent": "199 84% 55%",
          "--accent-foreground": "222 28% 7%",
          "--destructive": "6 78% 58%",
          "--destructive-foreground": "210 40% 96%",
          "--border": "220 18% 20%",
          "--input": "220 18% 20%",
          "--ring": "168 78% 45%",
          "--radius": "0.75rem",
          "--chart-1": "168 78% 45%",
          "--chart-2": "199 84% 55%",
          "--chart-3": "42 92% 58%",
          "--chart-4": "152 72% 45%",
          "--chart-5": "6 78% 58%"
        }
      },
      "gradient_policy": {
        "allowed": [
          "Hero background only (max 20% viewport)",
          "Large section background overlays", 
          "Decorative blobs behind cards (low opacity)",
          "Never on text-heavy surfaces"
        ],
        "recommended_gradients": [
          {
            "name": "Aurora Teal (subtle)",
            "css": "radial-gradient(900px circle at 20% 10%, rgba(45, 212, 191, 0.14), transparent 55%), radial-gradient(700px circle at 80% 0%, rgba(56, 189, 248, 0.10), transparent 50%)"
          },
          {
            "name": "Deep Navy Fade",
            "css": "linear-gradient(180deg, rgba(14, 20, 32, 0.0) 0%, rgba(14, 20, 32, 0.85) 70%, rgba(11, 15, 23, 1) 100%)"
          }
        ]
      }
    },

    "spacing_radius_shadow": {
      "spacing": {
        "page_padding": "px-4 sm:px-6 lg:px-8",
        "section_gap": "gap-6 lg:gap-8",
        "card_padding": "p-4 sm:p-5",
        "dense_row": "py-2.5"
      },
      "radius": {
        "card": "rounded-xl",
        "button": "rounded-lg",
        "input": "rounded-md",
        "pill": "rounded-full"
      },
      "shadow": {
        "card": "shadow-[0_1px_0_rgba(255,255,255,0.04),0_12px_30px_rgba(0,0,0,0.35)]",
        "popover": "shadow-[0_1px_0_rgba(255,255,255,0.05),0_18px_50px_rgba(0,0,0,0.55)]"
      },
      "glass": {
        "class": "bg-white/[0.03] backdrop-blur-md border border-white/[0.06]",
        "notes": [
          "Use glass only for: top nav, KPI highlight card, receipt AI preview card.",
          "Avoid glass on tables (tables must be crisp)."
        ]
      }
    },

    "motion": {
      "library": "framer-motion",
      "principles": [
        "Use motion for entrance (fade+slide 6–10px), hover lift (translateY -1px), and state changes.",
        "Respect prefers-reduced-motion.",
        "No bouncy overshoot; keep premium (easeOut)."
      ],
      "durations_ms": {
        "fast": 120,
        "base": 180,
        "slow": 260
      },
      "easings": {
        "standard": "[0.2, 0.8, 0.2, 1]",
        "out": "[0.16, 1, 0.3, 1]"
      },
      "snippets_js": {
        "page_enter": "const pageVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } } };",
        "card_hover": "whileHover={{ y: -1 }} transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}"
      }
    },

    "accessibility": {
      "requirements": [
        "WCAG AA contrast for text on dark surfaces.",
        "Visible focus ring: use ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-[hsl(var(--background))].",
        "Keyboard navigable tables, dialogs, dropdowns (shadcn handles most).",
        "Use icons + color for semantic meaning (income/expense arrows)."
      ]
    },

    "testing_attributes": {
      "rule": "All interactive and key informational elements MUST include data-testid.",
      "convention": "kebab-case describing role",
      "examples": [
        "data-testid=\"login-form-submit-button\"",
        "data-testid=\"dashboard-kpi-income\"",
        "data-testid=\"transactions-filter-category\"",
        "data-testid=\"receipt-upload-input\"",
        "data-testid=\"budget-progress-groceries\""
      ]
    }
  },

  "css_utilities_to_add": {
    "file": "/app/frontend/src/index.css",
    "utilities": [
      {
        "name": ".num",
        "css": ".num{font-variant-numeric:tabular-nums; font-feature-settings:'tnum' 1,'ss01' 1; font-family: var(--font-mono, ui-monospace); }"
      },
      {
        "name": ".noise-overlay",
        "css": ".noise-overlay{position:relative;} .noise-overlay:before{content:'';position:absolute;inset:0;pointer-events:none;background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E');mix-blend-mode:overlay;opacity:0.35;border-radius:inherit;}"
      }
    ],
    "notes": [
      "Noise overlay is subtle and premium; apply to hero background container only.",
      "Do NOT apply universal transitions."
    ]
  },

  "charts": {
    "library": "recharts",
    "palette": {
      "primary": "hsl(var(--chart-1))",
      "secondary": "hsl(var(--chart-2))",
      "warning": "hsl(var(--chart-3))",
      "success": "hsl(var(--chart-4))",
      "danger": "hsl(var(--chart-5))",
      "grid": "hsla(220, 18%, 26%, 0.55)",
      "axis": "hsla(210, 40%, 96%, 0.65)",
      "tooltip_bg": "hsla(222, 22%, 11%, 0.92)"
    },
    "styling_rules": [
      "Use CSS variables (no hardcoded hex) so theme stays consistent.",
      "CartesianGrid: vertical={false}, strokeDasharray='3 3', stroke=grid.",
      "Line: dot={false}, strokeWidth={2}.",
      "Tooltip: custom component using Card + font-mono for values.",
      "Donut chart: center label uses font-mono and shows total spend."
    ],
    "empty_states": {
      "chart_empty": "Show Skeleton chart block + caption: 'Add a transaction to see trends.'",
      "chart_loading": "Use shadcn Skeleton with 3–4 bars/lines."
    }
  },

  "layout_system": {
    "app_shell": {
      "desktop": {
        "structure": "Left sidebar (icon+label) + top header + content",
        "sidebar_width": "w-[260px]",
        "content_max": "max-w-[1280px]",
        "content_padding": "px-4 sm:px-6 lg:px-8 py-6"
      },
      "mobile": {
        "structure": "Top header + Sheet-based nav (hamburger) + content",
        "notes": [
          "Use shadcn Sheet for mobile nav.",
          "Keep primary CTA accessible in header (Add Transaction)."
        ]
      }
    },
    "grid": {
      "dashboard": "grid grid-cols-1 lg:grid-cols-12 gap-6",
      "kpi_row": "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",
      "two_col": "grid grid-cols-1 lg:grid-cols-2 gap-6",
      "three_col_cards": "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    }
  },

  "component_path": {
    "primary_shadcn_components": [
      "/app/frontend/src/components/ui/button.jsx",
      "/app/frontend/src/components/ui/card.jsx",
      "/app/frontend/src/components/ui/input.jsx",
      "/app/frontend/src/components/ui/label.jsx",
      "/app/frontend/src/components/ui/table.jsx",
      "/app/frontend/src/components/ui/dialog.jsx",
      "/app/frontend/src/components/ui/sheet.jsx",
      "/app/frontend/src/components/ui/select.jsx",
      "/app/frontend/src/components/ui/dropdown-menu.jsx",
      "/app/frontend/src/components/ui/tabs.jsx",
      "/app/frontend/src/components/ui/progress.jsx",
      "/app/frontend/src/components/ui/badge.jsx",
      "/app/frontend/src/components/ui/calendar.jsx",
      "/app/frontend/src/components/ui/tooltip.jsx",
      "/app/frontend/src/components/ui/skeleton.jsx",
      "/app/frontend/src/components/ui/sonner.jsx"
    ],
    "recommended_new_components_to_create": [
      {
        "path": "/app/frontend/src/components/Number.jsx",
        "purpose": "Centralize currency formatting + mono/tabular styling"
      },
      {
        "path": "/app/frontend/src/components/AppShell.jsx",
        "purpose": "Sidebar + header + responsive nav"
      },
      {
        "path": "/app/frontend/src/components/ChartCard.jsx",
        "purpose": "Shared chart container with title, actions, tooltip styling"
      },
      {
        "path": "/app/frontend/src/components/EmptyState.jsx",
        "purpose": "Consistent empty states with CTA"
      },
      {
        "path": "/app/frontend/src/components/ReceiptPreviewCard.jsx",
        "purpose": "AI extracted fields preview + edit affordances"
      }
    ]
  },

  "component_behavior_specs": {
    "buttons": {
      "variants": {
        "primary": {
          "classes": "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "motion": "hover: translateY(-1px) + subtle shadow increase; active: scale(0.98)"
        },
        "secondary": {
          "classes": "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
          "notes": "Use for non-destructive actions in modals"
        },
        "ghost": {
          "classes": "hover:bg-white/[0.04] text-foreground/85",
          "notes": "Use in table row actions"
        },
        "destructive": {
          "classes": "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        }
      },
      "sizes": {
        "sm": "h-8 px-3 text-xs",
        "md": "h-9 px-4 text-sm",
        "lg": "h-10 px-5 text-sm"
      },
      "data_testid_rule": "Every Button must have data-testid"
    },

    "inputs": {
      "rules": [
        "Inputs sit on surface with border-border; on focus show ring-ring.",
        "Use helper text for currency/base currency conversions.",
        "For amount fields: right-align text + font-mono + tabular nums."
      ],
      "amount_input_classes": "text-right font-mono tabular-nums"
    },

    "tables": {
      "rules": [
        "Dense rows but breathable: py-2.5, hover:bg-white/[0.03].",
        "Sticky header on desktop for long lists.",
        "Numeric columns right-aligned with font-mono.",
        "Row actions in DropdownMenu (kebab icon)."
      ],
      "row_hover": "hover:bg-white/[0.03]",
      "status_badges": {
        "cleared": "bg-white/[0.06] text-foreground/80",
        "pending": "bg-[hsla(42,92%,58%,0.12)] text-[hsl(42_92%_58%)]",
        "failed": "bg-[hsla(6,78%,58%,0.12)] text-[hsl(6_78%_58%)]"
      }
    },

    "cards": {
      "kpi_card": {
        "classes": "rounded-xl border border-border bg-card/80 noise-overlay",
        "notes": [
          "One KPI card per row can be ‘featured’ using glass class + subtle accent border.",
          "KPI delta uses Badge with arrow icon + semantic color."
        ]
      },
      "standard_card": {
        "classes": "rounded-xl border border-border bg-card shadow-[0_1px_0_rgba(255,255,255,0.04)]"
      }
    },

    "dialogs_drawers": {
      "rules": [
        "Use Dialog for desktop modals; Drawer for mobile add/edit flows.",
        "Dialog header: title (font-display), description (muted).",
        "Primary action pinned bottom-right; on mobile pinned bottom full-width."
      ]
    },

    "toasts": {
      "library": "sonner",
      "rules": [
        "Success toast after save: short, includes amount + category.",
        "Error toast: actionable message + retry if possible.",
        "All toast triggers must have data-testid on the triggering control."
      ]
    }
  },

  "page_blueprints": {
    "landing": {
      "goal": "Convert to signup; communicate AI receipt scan + budgets + multi-currency.",
      "layout": [
        "Top nav (logo left, Pricing/Features anchors, Login button, Primary CTA: ‘Start free’)",
        "Hero split: left copy + right product mock card stack (KPI + donut + receipt preview)",
        "Social proof strip (3 metrics: ‘Avg. time saved’, ‘Categories auto-detected’, ‘Currencies supported’)",
        "Feature bento grid (Receipt Scan, Auto-categorize, Budgets, Bills, Goals)",
        "Security/Privacy section (JWT, local control, export) — trust block",
        "Footer (minimal)"
      ],
      "hero_background": "Use Aurora Teal gradient overlay + noise-overlay; keep within top 20% viewport.",
      "primary_cta_testid": "landing-hero-start-free-button"
    },

    "auth_login_signup": {
      "layout": [
        "Centered card on canvas (NOT text-centered globally).",
        "Left: brand mark + short value prop; Right: form card.",
        "On mobile: single column, form first."
      ],
      "components": ["Card", "Input", "Label", "Button", "Separator"],
      "testids": [
        "login-email-input",
        "login-password-input",
        "login-submit-button",
        "signup-email-input",
        "signup-password-input",
        "signup-submit-button"
      ]
    },

    "dashboard": {
      "layout": [
        "Header row: Page title + base currency pill + primary CTA (Add Transaction) + secondary (Scan Receipt)",
        "KPI row (4 cards): Income, Expenses, Net, Savings Rate",
        "Main grid: left (Spending donut + category list), right (6-month trend line)",
        "Secondary grid: Budget progress list + Upcoming bills + Goals progress"
      ],
      "kpi_rules": [
        "KPI numbers use font-mono + tabular nums.",
        "Income green, expenses red-orange, net uses accent teal.",
        "Each KPI card includes a tiny sparkline (optional later) or delta badge."
      ],
      "testids": [
        "dashboard-kpi-income",
        "dashboard-kpi-expenses",
        "dashboard-kpi-net",
        "dashboard-kpi-savings-rate",
        "dashboard-add-transaction-button",
        "dashboard-scan-receipt-button"
      ]
    },

    "transactions": {
      "layout": [
        "Top controls: search, date range (Calendar in Popover), category Select, currency filter, Add button",
        "Table: Date, Merchant, Category, Amount, Currency, Notes, Actions",
        "Right rail (desktop optional): quick stats (month spend, top category)"
      ],
      "empty_state": "EmptyState with CTA: ‘Add your first transaction’ + secondary ‘Scan a receipt’.",
      "testids": [
        "transactions-search-input",
        "transactions-filter-date-button",
        "transactions-filter-category-select",
        "transactions-add-button",
        "transactions-table"
      ]
    },

    "receipt_scan": {
      "layout": [
        "Stepper header: Upload → Review → Save",
        "Upload card: drag/drop zone + file picker",
        "AI preview: extracted fields in a Card with editable inputs",
        "Side-by-side on desktop: image preview left, fields right; stacked on mobile"
      ],
      "states": {
        "uploading": "Show Skeleton image block + ‘Analyzing receipt…’",
        "ai_error": "Alert with retry + manual entry fallback",
        "review": "Highlight low-confidence fields with subtle warning badge"
      },
      "testids": [
        "receipt-upload-input",
        "receipt-analyze-button",
        "receipt-preview-card",
        "receipt-save-button"
      ]
    },

    "budgets": {
      "layout": [
        "Month selector (Tabs or Select) + Add Budget",
        "Budgets grid: category cards with Progress bar + spent/limit",
        "Over-budget cards show danger accent + subtle border"
      ],
      "testids": [
        "budgets-month-select",
        "budgets-add-button",
        "budgets-grid"
      ]
    },

    "recurring_bills": {
      "layout": [
        "Header: Add Bill",
        "List/table: Bill name, amount, frequency, next due date, status badge",
        "Upcoming due within 7 days gets warning badge"
      ],
      "testids": [
        "bills-add-button",
        "bills-list"
      ]
    },

    "savings_goals": {
      "layout": [
        "Header: Add Goal",
        "Cards grid: goal name, target date, Progress, current/target",
        "Each card includes ‘Add contribution’ quick action"
      ],
      "testids": [
        "goals-add-button",
        "goals-grid"
      ]
    },

    "settings": {
      "layout": [
        "Two-column settings on desktop: Profile/Security left, Preferences right",
        "Base currency Select + category management (table + add dialog)",
        "Danger zone: delete account (AlertDialog)"
      ],
      "testids": [
        "settings-base-currency-select",
        "settings-save-button",
        "settings-delete-account-button"
      ]
    }
  },

  "empty_loading_error_states": {
    "skeletons": {
      "rules": [
        "Use shadcn Skeleton for KPI cards, tables, and charts.",
        "Skeletons should match final layout to reduce layout shift."
      ],
      "examples": [
        "KPI: 1 line label + 1 big number + small delta pill",
        "Table: 8 rows x 6 columns grey bars",
        "Chart: 1 large block + 3 small legend pills"
      ]
    },
    "empty_states": {
      "tone": "Helpful, not cute. Offer next action.",
      "components": ["EmptyState (new)", "Button", "Card"],
      "copy_examples": [
        "‘No transactions yet. Add one manually or scan a receipt.’",
        "‘No budgets set for this month. Create a budget to track progress.’"
      ]
    },
    "error_states": {
      "rules": [
        "Use Alert component for inline errors.",
        "Use sonner toast for transient errors.",
        "Always include a retry action when possible."
      ]
    }
  },

  "image_urls": {
    "hero_backgrounds": [
      {
        "url": "https://images.unsplash.com/photo-1708305729900-906f34a7d49d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "usage": "Landing hero subtle abstract background (apply as low-opacity overlay, blur, max 20% viewport)"
      },
      {
        "url": "https://images.unsplash.com/photo-1707209856577-eeea3627f8bf?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "usage": "Optional decorative blob behind KPI mock cards (very low opacity)"
      }
    ],
    "textures": [
      {
        "url": "https://images.unsplash.com/photo-1650301545472-b3113cb014e4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "usage": "Subtle texture for landing section divider (use as masked background, 5–8% opacity)"
      }
    ]
  },

  "libraries_and_integrations": {
    "required": [
      {
        "name": "framer-motion",
        "install": "npm i framer-motion",
        "usage": "Page transitions, card hover, modal entrance"
      },
      {
        "name": "recharts",
        "install": "npm i recharts",
        "usage": "Dashboard donut + trend line + budget bars"
      }
    ],
    "optional": [
      {
        "name": "react-dropzone",
        "install": "npm i react-dropzone",
        "usage": "Receipt upload drag/drop zone"
      }
    ]
  },

  "instructions_to_main_agent": {
    "critical": [
      "Update /app/frontend/src/index.css tokens: dark is primary; avoid pure black; use warm navy palette above.",
      "Remove/ignore default CRA App.css centering patterns; do not center the whole app container.",
      "Use shadcn components for all interactive UI (Dialog, DropdownMenu, Calendar, Select, Sheet, etc.).",
      "All interactive + key informational elements must include data-testid.",
      "Use font-mono + tabular nums for all currency values and chart ticks/tooltips.",
      "Gradients only as subtle hero/section overlays (<=20% viewport). No saturated purple/pink gradients.",
      "Implement responsive AppShell: sidebar desktop, Sheet nav mobile."
    ],
    "recommended_build_order": [
      "1) Global tokens + fonts + AppShell",
      "2) Dashboard KPI + charts",
      "3) Transactions table + filters + add/edit modal",
      "4) Receipt scan flow",
      "5) Budgets/Bills/Goals",
      "6) Settings + category management",
      "7) Empty/loading/error states polish"
    ]
  },

  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
