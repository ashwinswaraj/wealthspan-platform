import { CheckCircle2, Clock, ShieldCheck, XCircle, Activity, Eye } from "lucide-react";
import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";
import {
  Stat,
  Row,
  Badge,
  SectionTitle,
} from "@admin/features/admin-dashboard/components/sections-shared";

/* ---------- Quality Analytics ---------- */
export const QualityAnalyticsView = () => (
  <div className="space-y-4">
    <SectionTitle title="Professional Quality Metrics" />
    <Row cols={4}>
      <Stat
        label="First Time Pass Rate"
        value="78.4%"
        icon={CheckCircle2}
        tint="bg-emerald-500/10 text-emerald-600"
      />
      <Stat label="Rework Rate" value="14.2%" icon={Clock} tint="bg-amber-500/10 text-amber-600" />
      <Stat
        label="QA Pass Rate"
        value="94.2%"
        icon={ShieldCheck}
        tint="bg-primary-container/10 text-primary-container"
      />
      <Stat
        label="QA Failure Rate"
        value="5.8%"
        icon={XCircle}
        tint="bg-rose-500/10 text-rose-600"
      />
    </Row>
    <Row cols={2}>
      <Stat
        label="Quality Reliability Score"
        value="9.1 / 10"
        icon={Activity}
        tint="bg-violet-500/10 text-violet-600"
      />
      <Stat
        label="Avg Review Time"
        value="42m"
        icon={Eye}
        tint="bg-primary-container/10 text-primary-container"
      />
    </Row>

    <div className="grid md:grid-cols-3 gap-3">
      <Card>
        <p className="text-sm font-bold mb-2">High Quality Categories</p>
        <ul className="text-xs space-y-1.5 text-on-surface-variant">
          <li className="flex justify-between">
            <span>Logo Design</span>
            <Badge tone="bg-emerald-50 text-emerald-700">FTPR 91%</Badge>
          </li>
          <li className="flex justify-between">
            <span>Brand Identity</span>
            <Badge tone="bg-emerald-50 text-emerald-700">FTPR 88%</Badge>
          </li>
        </ul>
      </Card>
      <Card>
        <p className="text-sm font-bold mb-2">High Rework Categories</p>
        <ul className="text-xs space-y-1.5 text-on-surface-variant">
          <li className="flex justify-between">
            <span>Video Editing</span>
            <Badge tone="bg-amber-50 text-amber-700">Rework 28%</Badge>
          </li>
          <li className="flex justify-between">
            <span>Pitch Decks</span>
            <Badge tone="bg-amber-50 text-amber-700">Rework 21%</Badge>
          </li>
        </ul>
      </Card>
      <Card>
        <p className="text-sm font-bold mb-2">Risk Categories</p>
        <ul className="text-xs space-y-1.5 text-on-surface-variant">
          <li className="flex justify-between">
            <span>Content Writing</span>
            <Badge tone="bg-rose-50 text-rose-700">Quality ↓</Badge>
          </li>
          <li className="flex justify-between">
            <span>Translation</span>
            <Badge tone="bg-rose-50 text-rose-700">Quality ↓</Badge>
          </li>
        </ul>
      </Card>
    </div>

    <div className="grid md:grid-cols-2 gap-3">
      <Card>
        <p className="text-sm font-bold mb-2">Common Rejection Reasons</p>
        <ul className="text-xs space-y-1.5 text-on-surface-variant">
          {[
            "Missing Files",
            "Poor Quality",
            "Incorrect Format",
            "Requirement Missed",
            "Deadline Issues",
          ].map((r) => (
            <li key={r} className="flex items-center justify-between">
              <span>{r}</span>
              <Badge tone="bg-slate-100 text-slate-700">view</Badge>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <p className="text-sm font-bold mb-2">Reviewer Analytics</p>
        <ul className="text-xs space-y-1.5 text-on-surface-variant">
          <li className="flex justify-between">
            <span>Reviews Completed</span>
            <span className="font-bold text-on-surface">312</span>
          </li>
          <li className="flex justify-between">
            <span>Average Review Time</span>
            <span className="font-bold text-on-surface">42m</span>
          </li>
          <li className="flex justify-between">
            <span>Escalation Rate</span>
            <span className="font-bold text-on-surface">3.1%</span>
          </li>
        </ul>
      </Card>
    </div>

    <Card>
      <p className="text-sm font-bold mb-2">Quality Alerts</p>
      <ul className="text-xs space-y-1.5">
        <li className="flex items-center gap-2">
          <Badge tone="bg-amber-50 text-amber-700">Alert</Badge> QA Backlog Increasing
        </li>
        <li className="flex items-center gap-2">
          <Badge tone="bg-rose-50 text-rose-700">Alert</Badge> Rework Rate High — Video Editing
        </li>
        <li className="flex items-center gap-2">
          <Badge tone="bg-rose-50 text-rose-700">Alert</Badge> Category Quality Declining — Content
          Writing
        </li>
        <li className="flex items-center gap-2">
          <Badge tone="bg-amber-50 text-amber-700">Alert</Badge> Repeated Professional Failures × 3
        </li>
      </ul>
    </Card>
  </div>
);

export const QualityAnalyticsSection = () => (
  <div className="space-y-6">
    <SectionHeader
      title="Analytics"
      subtitle="Assignment throughput, demand vs supply, first-time pass rate, rework intelligence & quality alerts."
    />
    <QualityAnalyticsView />
  </div>
);

export default QualityAnalyticsSection;
