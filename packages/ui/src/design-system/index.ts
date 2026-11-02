/**
 * Wealthspan Design System — SINGLE SOURCE OF TRUTH.
 *
 * Every UI concern for the Wealthspan app is exported from here.
 * Pages and features MUST import UI from `@wealthspan/ui/design-system` — never reach into
 * `@wealthspan/ui/components/*` directly.
 *
 * To add a new component:
 *   1. Add it inside `src/design-system/**`.
 *   2. Re-export it here.
 *   3. Only then use it from a page or feature.
 *
 * Anything not listed here does not exist as far as product code is concerned.
 */

// Tokens
export * from "./tokens";

// Primitives
export { Button, buttonVariants, type ButtonProps } from "./primitives/Button";
export { Input, Textarea, Select, FieldLabel, FieldHint } from "./primitives/Input";
export {
  AuthInput,
  AuthTextarea,
  AuthSelect,
  AuthFieldShell,
  AuthErrorText,
} from "./primitives/AuthInput";
export { PasswordStrength, type PasswordStrengthProps } from "./primitives/PasswordStrength";
export { Badge, Tag, StatusChip, type BadgeProps } from "./primitives/Badge";
export { Avatar, type AvatarProps } from "./primitives/Avatar";
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStat,
  SkeletonRow,
  SkeletonTable,
  SkeletonImage,
  SkeletonChart,
  SkeletonBoundary,
} from "./primitives/Skeleton";
export { Spinner, type SpinnerProps } from "./primitives/Spinner";
export { ProgressBar } from "./primitives/ProgressBar";
export {
  WealthspanToolbar,
  WealthspanFilterButton,
  WealthspanSortButton,
  type WealthspanToolbarProps,
} from "./primitives/WealthspanToolbar";

// Layout
export { AuthContainer, DashboardContainer, SectionContainer } from "./layout/Container";
export { Card, CardHeader, CardTitle, CardBody } from "./layout/Card";
export { StatCard, type StatCardProps } from "./layout/StatCard";
export { PageHeader, SectionHeader, type PageHeaderProps } from "./layout/PageHeader";

// Feedback
export { EmptyState, type EmptyStateProps } from "./feedback/EmptyState";
export { ErrorState } from "./feedback/ErrorState";
export { LoadingState } from "./feedback/LoadingState";
export {
  useSkeleton,
  NavbarSkeleton,
  MarketingPageSkeleton,
  LandingPageSkeleton,
  AuthPageSkeleton,
  DashboardSectionSkeleton,
  DashboardShellSkeleton,
  LivePaneSkeleton,
  LandingBodySkeleton,
  FooterSkeleton,
  ServicesBodySkeleton,
  DirectoryBodySkeleton,
  AnalyticsBodySkeleton,
  StoryBodySkeleton,
} from "./feedback/PageSkeletons";
export type { DashboardSectionVariant } from "./feedback/PageSkeletons";
export { useSkeletonState } from "./feedback/useSkeletonState";
export {
  PageSpinner,
  OverlaySpinner,
  ButtonSpinner,
  SpinnerBoundary,
} from "./feedback/SpinnerOverlay";

// Motion
export * as motionPresets from "./motion/transitions";

// Icons — one library only
export * as icons from "./icons";
