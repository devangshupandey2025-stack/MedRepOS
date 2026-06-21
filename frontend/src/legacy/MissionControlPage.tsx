import { useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  Lightbulb,
  Clock,
  Zap,
  ChevronRight,
  Command,
  Search,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const MOCK = {
  user: { name: "Sandip" },
  healthScore: {
    total: 82,
    breakdown: [
      { label: "Target Achievement", score: 34, max: 40 },
      { label: "Growth", score: 18, max: 20 },
      { label: "Coverage", score: 15, max: 20 },
      { label: "Risk Adjustment", score: 15, max: 20 },
    ],
  },
  monthlyProgress: { value: 74, daysRemaining: 12 },
  forecast: { value: 93, change: 2.4, direction: "up" as const },
  priorities: [
    { text: "Recover low-performing territories", type: "recovery" as const },
    { text: "Follow up on declining products", type: "followup" as const },
    { text: "Review outstanding sales pending approval", type: "review" as const },
    { text: "Focus on high-growth market opportunities", type: "growth" as const },
  ],
  risks: [
    {
      title: "ABIONE declining",
      detail: "MoM sales dropped 40% in Barrackpore",
      severity: "critical" as const,
    },
    {
      title: "Barrackpore underperforming",
      detail: "Territory at 62% of monthly target",
      severity: "warning" as const,
    },
    {
      title: "Monthly target at risk",
      detail: "18% gap to close in 12 days",
      severity: "warning" as const,
    },
    {
      title: "Product coverage gap",
      detail: "3 high-value products not detailed this month",
      severity: "info" as const,
    },
  ],
  opportunities: [
    {
      title: "ABIONE gaining traction",
      detail: "28% growth in adjacent territories",
      value: "+₹2.4L potential",
      trend: "up" as const,
    },
    {
      title: "New market entry",
      detail: "Uncovered territory with 12% monthly growth",
      value: "+₹1.8L potential",
      trend: "up" as const,
    },
    {
      title: "High-growth product mix",
      detail: "Top 3 products showing 22% combined growth",
      value: "+₹3.1L potential",
      trend: "up" as const,
    },
  ],
  brief: `You are at 74% of your monthly target with 12 days remaining. ABIONE requires immediate attention in Barrackpore — consider a focused recovery plan. Your forecast is strong at 93%, driven by strong performance in growth territories. Prioritize Barrackpore recovery this week and maintain momentum on top-performing products.`,
  timeline: [
    { time: "10:05 AM", text: "ABIONE entered Top 5 products", type: "positive" as const },
    { time: "10:04 AM", text: "Risk detected in Barrackpore territory", type: "risk" as const },
    { time: "10:03 AM", text: "Forecast increased to 94%", type: "positive" as const },
    { time: "10:02 AM", text: "Import completed — April sales data", type: "neutral" as const },
    { time: "09:45 AM", text: "Session started", type: "neutral" as const },
  ],
}

type PriorityType = (typeof MOCK.priorities)[0]
type RiskItem = (typeof MOCK.risks)[0]
type TimelineEvent = (typeof MOCK.timeline)[0]

function SeverityBadge({ severity }: { severity: RiskItem["severity"] }) {
  const map = {
    critical: { variant: "danger" as const, label: "Critical" },
    warning: { variant: "warning" as const, label: "Warning" },
    info: { variant: "secondary" as const, label: "Info" },
  }
  const { variant, label } = map[severity]
  return <Badge variant={variant}>{label}</Badge>
}

function PriorityIcon({ type }: { type: PriorityType["type"] }) {
  const map = {
    recovery: <TrendingDown className="h-4 w-4 text-red-400" />,
    followup: <Clock className="h-4 w-4 text-amber-400" />,
    review: <Activity className="h-4 w-4 text-blue-400" />,
    growth: <Zap className="h-4 w-4 text-emerald-400" />,
  }
  return map[type]
}

function TimelineDot({ type }: { type: TimelineEvent["type"] }) {
  const colors = {
    positive: "bg-emerald-500",
    risk: "bg-red-500",
    neutral: "bg-muted-foreground",
  }
  return <div className={`h-2 w-2 rounded-full ${colors[type]} mt-1.5 shrink-0`} />
}

function TrendIcon({ direction }: { direction: "up" | "down" }) {
  if (direction === "up") return <ArrowUp className="h-3 w-3 text-emerald-400" />
  return <ArrowDown className="h-3 w-3 text-red-400" />
}

function HealthScoreCard() {
  const { total, breakdown } = MOCK.healthScore
  const scoreColor = total >= 80 ? "text-emerald-400" : total >= 60 ? "text-amber-400" : "text-red-400"

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Activity className="h-4 w-4 text-emerald-400" />
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold tracking-tight ${scoreColor}`}>{total}</span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="mt-4 space-y-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular-nums">
                <span className={item.score >= item.max * 0.75 ? "text-emerald-400" : item.score >= item.max * 0.5 ? "text-amber-400" : "text-red-400"}>
                  {item.score}
                </span>
                <span className="text-muted-foreground">/{item.max}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MonthlyProgressCard() {
  const { value, daysRemaining } = MOCK.monthlyProgress
  const barColor = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500"

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Target className="h-4 w-4 text-emerald-400" />
          Monthly Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-foreground">{value}%</span>
        </div>
        <div className="mt-4">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {daysRemaining} days remaining
        </p>
      </CardContent>
    </Card>
  )
}

function ForecastCard() {
  const { value, change, direction } = MOCK.forecast

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Forecast Achievement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-foreground">{value}%</span>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-sm">
          <TrendIcon direction={direction} />
          <span className={direction === "up" ? "text-emerald-400" : "text-red-400"}>
            +{change}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

function TodaysPriorities() {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Zap className="h-4 w-4 text-emerald-400" />
          Today&apos;s Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK.priorities.map((p, i) => (
          <div key={i} className="group flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50">
            <PriorityIcon type={p.type} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{p.text}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RiskCenter() {
  return (
    <Card className="bg-card/50 backdrop-blur border-red-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          Risk Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK.risks.map((risk, i) => (
          <div key={i} className="group flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50">
            <div className="mt-0.5">
              <SeverityBadge severity={risk.severity} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{risk.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{risk.detail}</p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function OpportunityCenter() {
  return (
    <Card className="bg-card/50 backdrop-blur border-emerald-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-emerald-400" />
          Opportunity Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK.opportunities.map((opp, i) => (
          <div key={i} className="group flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{opp.title}</p>
                <span className="text-xs font-semibold text-emerald-400">{opp.value}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{opp.detail}</p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ExecutiveBrief() {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Command className="h-4 w-4 text-emerald-400" />
          Executive Brief
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{MOCK.brief}</p>
      </CardContent>
    </Card>
  )
}

function ActivityTimeline() {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Activity className="h-4 w-4 text-emerald-400" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="relative pl-4">
          <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-border" />
          <div className="space-y-4">
            {MOCK.timeline.map((event, i) => (
              <div key={i} className="relative flex items-start gap-3">
                <TimelineDot type={event.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{event.text}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")

  const commands = [
    { id: "forecast", label: "Forecast this month", icon: TrendingUp },
    { id: "risks", label: "Show risks", icon: AlertTriangle },
    { id: "products", label: "Top products", icon: Activity },
    { id: "import", label: "Import report", icon: Command },
    { id: "brief", label: "Generate brief", icon: Lightbulb },
  ]

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2">
        <Card className="border-border/50 shadow-2xl">
          <CardContent className="p-0">
            <div className="flex items-center border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                className="border-0 bg-transparent px-3 py-4 text-sm shadow-none focus-visible:ring-0"
                placeholder="Type a command..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <kbd className="flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                <X className="h-3 w-3" />
                Esc
              </kbd>
            </div>
            <div className="p-2">
              {filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                  onClick={onClose}
                >
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No commands found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function MissionControlPage() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const [greeting, setGreeting] = useState("Good Morning")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 17) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-foreground">MedRepOS</span>
          </div>
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/80"
          >
            <Command className="h-3.5 w-3.5" />
            <span>Command</span>
            <kbd className="flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {greeting}, {MOCK.user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your current situation at a glance
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HealthScoreCard />
          <MonthlyProgressCard />
          <ForecastCard />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <TodaysPriorities />
          <RiskCenter />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <OpportunityCenter />
          <ExecutiveBrief />
        </div>

        <div className="max-w-md">
          <ActivityTimeline />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-6">
          <p className="text-xs text-muted-foreground">MedRepOS v2 — Mission Control</p>
          <p className="text-xs text-muted-foreground">Operational Command Center</p>
        </div>
      </footer>
    </div>
  )
}
