import type { ProfessionalCardData } from "@jobrio/types/professional";
export type { ProfessionalCardData };
import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Star,
  Zap,
  Target,
  CheckCircle,
  Copy,
  Share2,
  Wifi,
  WifiOff,
  Pause,
  AlertCircle,
  Download,
} from "lucide-react";

const statusConfig = {
  ACTIVE: { color: "bg-tertiary", pulse: true, label: "Active", icon: Wifi },
  IDLE: { color: "bg-yellow-500", pulse: false, label: "Idle", icon: Pause },
  BUSY: { color: "bg-red-500", pulse: true, label: "Busy", icon: AlertCircle },
  OFFLINE: { color: "bg-gray-500", pulse: false, label: "Offline", icon: WifiOff },
};

const tierConfig = {
  Standard: { gradient: "from-zinc-400 to-zinc-500", badge: "bg-zinc-400", label: "Standard" },
  Premium: { gradient: "from-slate-300 to-slate-400", badge: "bg-slate-300", label: "Premium" },
  Elite: { gradient: "from-amber-400 to-yellow-500", badge: "bg-amber-400", label: "Elite" },
};

const badgeIcons: Record<string, typeof Shield> = {
  "Verified Identity": ShieldCheck,
  "4.8 Rating": Star,
  "Fast Delivery": Zap,
  "High Reliability": Shield,
  "Top Performer": Target,
};

interface Props {
  data: ProfessionalCardData;
  isFlipped: boolean;
  isQrExpanded: boolean;
  onFlip: () => void;
  onQrExpand: () => void;
}

const ProfessionalIdCard = ({ data, isFlipped, isQrExpanded, onFlip, onQrExpand }: Props) => {
  const [copied, setCopied] = useState(false);

  const status = statusConfig[data.status];
  const tier = tierConfig[data.tier];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(data.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `jobrio.com/id/${data.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${data.name} — Jobrio`,
          text: `Check out ${data.name}'s profile on Jobrio`,
          url: `https://${shareUrl}`,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`https://${shareUrl}`);
    }
  };

  const handleQrTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQrExpand();
  };

  const handleDownloadQr = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=jobrio.com/id/${data.id}`;
    link.download = `${data.id}-qr.png`;
    link.click();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=jobrio.com/id/${data.id}`;

  const availabilityText =
    data.status === "ACTIVE"
      ? "Available for assignment"
      : data.status === "IDLE"
        ? "Not eligible (Toggle OFF)"
        : data.status === "BUSY"
          ? `Currently working on ${data.activeOrders || 1} orders`
          : "Currently offline";

  return (
    <div className="min-w-[370px] h-[600px] snap-start" style={{ perspective: "1500px" }}>
      <div
        className="relative h-full w-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={onFlip}
      >
        {/* ============ FRONT ============ */}
        <div
          className="absolute inset-0 bg-surface-container-lowest border-2 border-primary/60 flex flex-col p-5 shadow-xl premium-id-glow rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* QR Expanded Overlay — no close button, tap outside QR to close */}
          {isQrExpanded && (
            <div
              className="absolute inset-0 z-50 bg-surface-container-lowest/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
              onClick={handleQrTap}
              style={{ animation: "qrExpandIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
            >
              <div
                className="w-56 h-56 bg-white rounded-2xl p-3 shadow-2xl mb-6"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={qrUrl} className="w-full h-full" alt="QR Code" />
              </div>
              <p
                className="text-[10px] font-mono text-secondary/60 mb-4"
                onClick={(e) => e.stopPropagation()}
              >
                {data.id}
              </p>
              <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleDownloadQr}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-surface-container-low text-primary px-4 py-2.5 rounded-xl text-xs font-bold border border-outline-variant/30 hover:bg-surface-container transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>
          )}

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <span className="text-primary-container font-black text-lg tracking-tighter">
                Jobrio
              </span>
              <span className="text-[7px] font-bold text-secondary/60 uppercase tracking-widest -mt-1">
                Managed Execution Platform
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? "animate-pulse" : ""}`}
              ></span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-secondary/70">
                {status.label}
              </span>
            </div>
          </div>

          {/* Identity Block */}
          <div className="flex flex-col items-center py-2">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-surface-container-high p-0.5 bg-surface-container-lowest">
                <img
                  src={data.img}
                  className="w-full h-full object-cover rounded-full"
                  alt={data.name}
                />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 bg-gradient-to-br ${tier.gradient} text-on-surface w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-surface-container-lowest shadow-md`}
                title={`${tier.label} Tier — Assigned based on performance & quality score`}
              >
                <Shield className="w-3.5 h-3.5 text-white" fill="currentColor" />
              </div>
            </div>
            <h2 className="text-lg font-extrabold text-on-surface mb-0.5">{data.name}</h2>
            <p className="text-primary-container font-bold text-[10px] uppercase tracking-widest mb-0.5">
              {data.role}
            </p>
            <span className="text-[9px] font-bold text-secondary/50 uppercase tracking-wider">
              {data.category}
            </span>
          </div>

          {/* Unique ID */}
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="text-[9px] font-mono text-secondary/60">{data.id}</span>
            <button
              onClick={handleCopy}
              className="p-0.5 hover:bg-surface-container-low rounded transition-colors"
              title="Copy ID"
              aria-label="Copy professional ID"
            >
              <Copy className="w-3 h-3 text-secondary/50" />
            </button>
            {copied && <span className="text-[8px] text-tertiary font-bold">Copied!</span>}
          </div>

          {/* Quality Tier */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className={`bg-gradient-to-r ${tier.gradient} px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm`}
            >
              <Shield className="w-3 h-3 text-white" fill="currentColor" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                {tier.label} Tier
              </span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1 mb-2">
            {data.badges.map((badge) => {
              const Icon = badgeIcons[badge] || CheckCircle;
              return (
                <div
                  key={badge}
                  className="flex-shrink-0 flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-full border border-outline-variant/20"
                >
                  <Icon className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[7px] font-bold text-on-surface-variant whitespace-nowrap">
                    {badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live Performance Strip */}
          <div className="bg-surface-container-low rounded-xl p-3 mb-2">
            <div className="text-[8px] font-bold text-secondary uppercase tracking-widest mb-2">
              Live Performance
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="text-center">
                <div className="text-sm font-black text-primary">{data.acceptanceRate}%</div>
                <div className="text-[7px] text-secondary/60 font-bold">Accept</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-black text-primary">{data.ordersCompleted}</div>
                <div className="text-[7px] text-secondary/60 font-bold">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-black text-primary">{data.onTimeRate}%</div>
                <div className="text-[7px] text-secondary/60 font-bold">On-Time</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-black text-primary">{data.responseSpeed}</div>
                <div className="text-[7px] text-secondary/60 font-bold">Speed</div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-1.5 justify-center mb-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${status.color} ${status.pulse ? "animate-pulse" : ""}`}
            ></span>
            <span className="text-[9px] font-bold text-on-surface-variant">{availabilityText}</span>
          </div>

          {/* Bottom */}
          <div className="mt-auto flex justify-between items-center pt-2 border-t border-outline-variant/20">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg text-[8px] font-bold text-primary hover:bg-surface-container transition-colors"
              title="Share"
              aria-label={`Share ${data.name}'s profile`}
            >
              <Share2 className="w-3 h-3" /> Share
            </button>
            <button
              type="button"
              className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg p-0.5 opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer"
              onClick={handleQrTap}
              title="Tap to expand QR"
              aria-label="Expand QR code"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=jobrio.com/id/${data.id}`}
                className="w-full h-full"
                alt="QR"
              />
            </button>
          </div>
        </div>

        {/* ============ BACK ============ */}
        <div
          className="absolute inset-0 bg-surface-container-high border-2 border-primary/60 p-5 flex flex-col rounded-2xl shadow-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-on-surface uppercase text-xs tracking-widest">
              Deep Profile
            </h3>
            <span className="text-[9px] font-mono opacity-40">{data.id}</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto hide-scrollbar">
            {/* Professional Details */}
            <div>
              <div className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">
                Professional Details
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-secondary/70">Primary Category</span>
                  <span className="font-bold text-on-surface">{data.category}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-secondary/70">Secondary Skills</span>
                  <span className="font-bold text-on-surface text-right max-w-[55%]">
                    {data.secondarySkills.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-secondary/70">Experience</span>
                  <span className="font-bold text-on-surface">{data.experience} years</span>
                </div>
              </div>
            </div>

            {/* Performance Details */}
            <div>
              <div className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">
                Performance Details
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/10">
                  <div className="text-[7px] font-bold text-secondary uppercase">Avg Rating</div>
                  <div className="text-lg font-black text-primary flex items-center gap-1">
                    {data.avgRating} <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/10">
                  <div className="text-[7px] font-bold text-secondary uppercase">Quality Score</div>
                  <div className="text-lg font-black text-primary">
                    {data.qualityScore}
                    <span className="text-[9px] font-normal text-secondary/60">/100</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[7px] font-bold text-secondary uppercase">
                    Progress to{" "}
                    {data.tier === "Elite"
                      ? "Elite"
                      : data.tier === "Premium"
                        ? "Elite"
                        : "Premium"}
                  </span>
                  <span className="text-[9px] font-black text-primary">{data.tierProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${tier.gradient} rounded-full transition-all duration-1000`}
                    style={{ width: `${data.tierProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* System History */}
            <div>
              <div className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">
                System History
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-secondary/70">Joined Jobrio</span>
                  <span className="font-bold text-on-surface">{data.joinedYear}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-secondary/70">Last Active</span>
                  <span className="font-bold text-on-surface">Today</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-secondary/70">Total Active Days</span>
                  <span className="font-bold text-on-surface">{data.totalActiveDays}</span>
                </div>
              </div>
            </div>

            {/* System Validation */}
            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-tertiary" />
                <span className="text-[9px] font-bold text-tertiary uppercase">
                  System Validated
                </span>
              </div>
              <p className="text-[8px] text-secondary/70 leading-relaxed">
                Verified by Jobrio Identity System. Work executed under Jobrio infrastructure.
              </p>
            </div>
          </div>

          {/* Bottom with Share + QR */}
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg text-[8px] font-bold text-primary hover:bg-surface-container transition-colors"
              >
                <Share2 className="w-3 h-3" /> Share
              </button>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase text-primary tracking-tighter">
                  QR Verification
                </span>
                <span className="text-[7px] text-secondary/50">Scan → Public Profile</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-surface-container-lowest flex items-center justify-center rounded-lg p-0.5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=jobrio.com/id/${data.id}`}
                className="w-full h-full"
                alt="QR"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalIdCard;
