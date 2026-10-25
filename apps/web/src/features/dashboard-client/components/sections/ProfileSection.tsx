import { useEffect, useState } from "react";
import { SectionHeader, Card } from "@/components/dashboard/shared";
import { loadSignup } from "@jobrio/auth/signupStorage";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9vhTcCQikB8T9MsVGe1s3gVWD9KajbL_sKAMf2G44mAv_M4U8OM9X7hdDb4116_PKxpM5KYW9s6PaxuTMGlhIJxspLNkfqnMfZ_K2gh_kN-4V62M_5cITr0emrfvKYim2NC_lPMuPQTIlhQS4TXf9TYhNitfBSqsZXtk-OvKZs8QrW7ZYqwg9ow3WA_kn7AuGPhnf4DjVDwxlae7pAsBw0_8gSZ8gdA8lc7aqep5TymfPBf6TG4_bmqL_U4fBHFUl7k9OJ5-lckCB";

const STATS: Record<"client" | "professional", { l: string; v: string }[]> = {
  client: [
    { l: "Orders placed", v: "48" },
    { l: "Active orders", v: "3" },
    { l: "Total spend", v: "₹2.4L" },
    { l: "Member since", v: "2024" },
  ],
  professional: [
    { l: "Jobs completed", v: "126" },
    { l: "On-time rate", v: "98%" },
    { l: "Rating", v: "4.9 / 5" },
    { l: "Member since", v: "2024" },
  ],
};

interface SignupProfile {
  photo?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  emailVerified?: boolean;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  pincode?: string;
  completedAt?: string;
  // client
  clientType?: "individual" | "company";
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  linkedin?: string;
  billingName?: string;
  billingAddress?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingPincode?: string;
  currency?: string;
  billingEmail?: string;
  gstVat?: string;
  taxId?: string;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptTos?: boolean;
  // professional
  primaryCategory?: string;
  subCategory?: string;
  secondaryServices?: string;
  skills?: string;
  experience?: string;
  portfolio?: string;
  bio?: string;
  dailyHours?: string;
  weeklyCapacity?: string;
  expectedPayout?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  idUploadName?: string;
  certificationsName?: string;
}

const EMPTY = "—";

const titleCase = (v?: string) =>
  !v
    ? EMPTY
    : v
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

const text = (v?: string) => (v && v.trim() ? v.trim() : EMPTY);

const dateText = (v?: string) => {
  if (!v) return EMPTY;
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const yesNo = (v?: boolean) => (v ? "Accepted" : "Not accepted");

type Row = { l: string; v: string; full?: boolean };

const DetailGroup = ({ title, rows }: { title: string; rows: Row[] }) => (
  <Card className="p-0 overflow-hidden">
    <p className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wider text-outline font-bold">
      {title}
    </p>
    <ul className="divide-y divide-outline-variant/30">
      {rows.map((r) => (
        <li
          key={r.l}
          className={
            r.full
              ? "px-5 py-3 text-sm space-y-1"
              : "flex items-center justify-between gap-4 px-5 py-3 text-sm"
          }
        >
          <span className="text-on-surface-variant shrink-0">{r.l}</span>
          <span
            className={
              r.full
                ? "block font-medium text-on-surface whitespace-pre-line"
                : "font-semibold text-on-surface text-right break-words"
            }
          >
            {r.v}
          </span>
        </li>
      ))}
    </ul>
  </Card>
);

export const ProfileSection = ({
  name,
  role,
  onOpenSettings,
}: {
  name: string;
  role: "client" | "professional";
  onOpenSettings: () => void;
}) => {
  const [d, setD] = useState<SignupProfile>({});

  useEffect(() => {
    setD(loadSignup<SignupProfile>(role));
  }, [role]);

  const displayName = d.fullName?.trim() || name;

  const personal: Row[] = [
    { l: "Full name", v: text(d.fullName) || name },
    { l: "Date of birth", v: dateText(d.dob) },
    { l: "Gender", v: titleCase(d.gender) },
  ];

  const contact: Row[] = [
    { l: "Contact email", v: text(d.email) },
    { l: "Email verified", v: d.emailVerified ? "Verified" : "Pending" },
    { l: "Phone number", v: text(d.phone) },
  ];

  const address: Row[] = [
    { l: "Address line 1", v: text(d.address1) },
    { l: "Address line 2", v: text(d.address2) },
    { l: "City", v: text(d.city) },
    { l: "State", v: text(d.state) },
    { l: "Country", v: text(d.country) },
    { l: "Pincode", v: text(d.pincode) },
  ];

  const clientTypeRows: Row[] = [
    { l: "Client type", v: titleCase(d.clientType) },
    ...(d.clientType === "company"
      ? [
          { l: "Company name", v: text(d.companyName) },
          { l: "Industry", v: text(d.industry) },
          { l: "Company size", v: text(d.companySize) },
        ]
      : []),
    { l: "Website", v: text(d.website) },
    { l: "LinkedIn", v: text(d.linkedin) },
  ];

  const billingRows: Row[] = [
    { l: "Billing name", v: text(d.billingName) },
    { l: "Billing email", v: text(d.billingEmail) },
    { l: "Billing address", v: text(d.billingAddress) },
    { l: "City", v: text(d.billingCity) },
    { l: "State", v: text(d.billingState) },
    { l: "Country", v: text(d.billingCountry) },
    { l: "Pincode", v: text(d.billingPincode) },
    { l: "Preferred currency", v: text(d.currency) },
    { l: "GST / VAT", v: text(d.gstVat) },
    { l: "Tax ID", v: text(d.taxId) },
  ];

  const proDetails: Row[] = [
    { l: "Primary category", v: titleCase(d.primaryCategory) },
    { l: "Sub-category", v: text(d.subCategory) },
    { l: "Secondary services", v: text(d.secondaryServices) },
    { l: "Skills", v: text(d.skills) },
    { l: "Experience", v: d.experience ? `${d.experience} years` : EMPTY },
    { l: "Portfolio", v: text(d.portfolio) },
    { l: "LinkedIn", v: text(d.linkedin) },
    { l: "Professional bio", v: text(d.bio), full: true },
  ];

  const capacity: Row[] = [
    { l: "Daily working hours", v: d.dailyHours ? `${d.dailyHours} hours` : EMPTY },
    { l: "Weekly capacity", v: d.weeklyCapacity ? `${d.weeklyCapacity} hours / week` : EMPTY },
    { l: "Expected payout", v: text(d.expectedPayout) },
  ];

  const idVerification: Row[] = [
    { l: "Nationality", v: text(d.nationality) },
    { l: "ID type", v: titleCase(d.idType) },
    { l: "ID number", v: text(d.idNumber) },
    { l: "ID document", v: text(d.idUploadName) },
    { l: "Certifications", v: text(d.certificationsName) },
  ];

  const agreements: Row[] = [
    { l: "Terms & Conditions", v: yesNo(d.acceptTerms) },
    { l: "Privacy Policy", v: yesNo(d.acceptPrivacy) },
    { l: "Terms of Service", v: yesNo(d.acceptTos) },
    { l: "Signed up on", v: dateText(d.completedAt) },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        subtitle={
          role === "client"
            ? "Everything you shared while creating your client account."
            : "Everything you shared while creating your professional account."
        }
        action={
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            title="Settings"
            className="w-10 h-10 rounded-full border border-outline-variant/40 hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center text-on-surface-variant shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              settings
            </span>
          </button>
        }
      />

      <Card className="flex flex-col sm:flex-row sm:items-center gap-5">
        <img
          src={d.photo || AVATAR}
          alt={displayName}
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xl font-extrabold font-headline text-on-surface truncate">
            {displayName}
          </p>
          <p className="text-sm text-on-surface-variant">
            {role === "client" ? "I'm a client at Jobrio" : "I'm a professional at Jobrio"}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
              {d.emailVerified ? "Verified" : "Verification pending"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant">
              {role === "client"
                ? d.clientType === "company"
                  ? "Company account"
                  : "Individual account"
                : titleCase(d.primaryCategory) === EMPTY
                  ? "Professional"
                  : titleCase(d.primaryCategory)}
            </span>
            {(d.city || d.country) && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant">
                {[d.city, d.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold shrink-0"
        >
          Edit profile
        </button>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS[role].map((s) => (
          <Card key={s.l}>
            <p className="text-[11px] uppercase tracking-wider text-outline font-bold">{s.l}</p>
            <p className="text-xl font-extrabold font-headline text-on-surface mt-1">{s.v}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <DetailGroup title="Personal details" rows={personal} />
        <DetailGroup title="Contact & verification" rows={contact} />
        <DetailGroup title="Address" rows={address} />

        {role === "client" ? (
          <>
            <DetailGroup title="Client type & company" rows={clientTypeRows} />
            <DetailGroup title="Billing & tax" rows={billingRows} />
          </>
        ) : (
          <>
            <DetailGroup title="Professional details" rows={proDetails} />
            <DetailGroup title="Work capacity" rows={capacity} />
            <DetailGroup title="Identity verification" rows={idVerification} />
          </>
        )}

        <DetailGroup title="Agreements" rows={agreements} />
      </div>
    </div>
  );
};
