import { ACCESS } from "./auth";
import { PROVIDER_TILE_CLAIMS, WorkQueueClaims } from "./work-queue-claims";

/**
 * Navigation / home quick-action claim types (JWT ClaimType strings).
 */
export const NavClaims = {
  caseSearch: "Case Search",
  dashboard: "Dashboard",
  workQueue: "Work Queue",
  reports: "Reports",
  viewReports: "View Reports",
  vaReports: "VAReports",
  vaReportsSpaced: "VA Reports",
  vaReportDashboard: "VAReportDashboard",
  providerReports: "ProviderReports",
  reworkDashboard: "ReworkDashboard",
  reworkDashboardSpaced: "Rework Dashboard",
  approveReportsToVaDashboard: "Approve Reports to VA Dashboard",
  travel: "VeteranTravelReimbursements",
  invoice: "Invoice",
  clearVbmsInvoice: "Clear VBMS Invoice",
  billingRateMaster: "VetFedToVA Rate Master",
  viewProviderBilling: "ViewProviderBilling",
  userManagement: "User Management",
  roleManagement: "Role Management and Definition",
  esrTagConfiguration: "Esr Tag Configuration",
  dbqTemplateCreation: "DBQ Template Creation",
  dotPhrase: "DotPhrase",
  autoQueueAdmin: "Auto Queue Admin",
  cptConfig: "CptConfig",
  viewOrganization: "ViewOrganizationInformation",
  editOrganization: "EditOrganizationInformation",
  viewFacility: "ViewFacilityInformation",
  editFacility: "EditFacilityInformation",
  viewProviderUser: "ViewProviderUserInformation",
  editProviderUser: "EditProviderUserInformation",
  providerCalendar: "ProviderCalendar",
  calendarAdmin: "CalendarAdmin",
  holidayCalendarAdmin: "Holiday Calendar Admin",
  examinerCalendar: "ExaminerCalendar",
  provider: "Provider",
  providerDashboard: "ProviderDashboard",
  providerWorkQueuesAccess: "Provider Work Queues Access",
  burdenTimeTemplate: "Burden Time Template",
  editBurdenTime: "Edit Burden Time",
  dbqMockTraining: "DBQ Mock Training",
  /** Left-rail group that Announcements Config sits under (#21722). */
  systemNotifications: "SystemNotifications",
  /** Home announcements gear + /system-announcements create/edit/delete. */
  announcementsConfig: "Announcements Config",
  /** Final Case Reviewer role — used to gate the provider-facing DOTPhrase Library. */
  finalCaseReview: "Final Case Review",
} as const;

type HasClaimFn = (claimType: string, claimValue?: string) => boolean;

export const isNavClaimAllowed = (hasClaim: HasClaimFn, claimType: string): boolean =>
  hasClaim(claimType, ACCESS.ALLOWED);

export const hasAnyNavClaim = (
  hasClaim: HasClaimFn,
  claimTypes: readonly string[]
): boolean => claimTypes.some((c) => isNavClaimAllowed(hasClaim, c));

/**
 * If `claims` is omitted/empty → always visible.
 * If provided → show only when at least one ClaimType is Allowed.
 */
export const canAccessNavItem = (
  hasClaim: HasClaimFn,
  claims?: readonly string[]
): boolean => !claims?.length || hasAnyNavClaim(hasClaim, claims);

/** Home Quick Actions — ClaimType must be Allowed to show. */
export const QUICK_ACTION_CLAIMS = {
  caseSearch: [NavClaims.caseSearch],
  provider: [
    NavClaims.provider,
    NavClaims.providerDashboard,
    NavClaims.providerWorkQueuesAccess,
  ],
  availabilityCalendar: [
    NavClaims.providerCalendar,
    NavClaims.calendarAdmin,
    NavClaims.examinerCalendar,
  ],
  providerUsers: [NavClaims.viewProviderUser, NavClaims.editProviderUser],
} as const;

/** Top-level left-rail sections. */
export const SIDEBAR_SECTION_CLAIMS = {
  // Home is always available as the app landing surface.
  home: [] as const,
  workQueues: [
    NavClaims.workQueue,
    WorkQueueClaims.providerWorkQueuesAccess,
    WorkQueueClaims.provider,
    ...Object.values(PROVIDER_TILE_CLAIMS).flat(),
  ],
  reports: [
    NavClaims.vaReports,
    NavClaims.vaReportsSpaced,
    NavClaims.vaReportDashboard,
    NavClaims.reports,
    NavClaims.viewReports,
    NavClaims.providerReports,
    NavClaims.reworkDashboard,
    NavClaims.reworkDashboardSpaced,
  ],
  travel: [NavClaims.travel],
  billing: [
    NavClaims.invoice,
    NavClaims.clearVbmsInvoice,
    NavClaims.billingRateMaster,
    NavClaims.viewProviderBilling,
  ],
  systemNotifications: [NavClaims.systemNotifications],
} as const;

export const SIDEBAR_SYSTEM_NOTIFICATION_ITEM_CLAIMS = {
  announcementsConfig: [NavClaims.announcementsConfig],
} as const;

/**
 * Reports submenu — show an item only when its dedicated ClaimType is Allowed.
 *
 * Admin (VAReports + View Reports + ReworkDashboard): all three.
 * Provider (Reports + ProviderReports only): Exam Archive only.
 */
export const SIDEBAR_REPORT_ITEM_CLAIMS = {
  vaReports: [
    NavClaims.vaReports,
    NavClaims.vaReportsSpaced,
    NavClaims.vaReportDashboard,
  ],
  /** Admin View Reports — providers typically have Reports/ProviderReports only. */
  monthlyReports: [NavClaims.viewReports],
  /** Exam Archive — ReworkDashboard (admin) or Reports/ProviderReports (provider). */
  examArchive: [
    NavClaims.reworkDashboard,
    NavClaims.reworkDashboardSpaced,
    NavClaims.reports,
    NavClaims.providerReports,
  ],
} as const;

export const SIDEBAR_TRAVEL_ITEM_CLAIMS = {
  travelInstanceClaimReport: [NavClaims.travel],
  travelPaymentUpload: [NavClaims.travel],
} as const;

export const SIDEBAR_BILLING_ITEM_CLAIMS = {
  vbmsInvoiceFiles: [NavClaims.invoice, NavClaims.clearVbmsInvoice],
  labNonLabPriceUpload: [NavClaims.invoice, NavClaims.viewProviderBilling],
  billingRateMaster: [NavClaims.billingRateMaster],
} as const;

/** Administration / Configuration secondary menu (screenshot panel). */
export const SIDEBAR_ADMIN_ITEM_CLAIMS = {
  users: [NavClaims.userManagement],
  roles: [NavClaims.roleManagement],
  esrTags: [NavClaims.esrTagConfiguration],
  // Unmapped config items — User Management so providers do not see them.
  accommodation: [NavClaims.userManagement],
  dbqBuilder: [NavClaims.dbqTemplateCreation],
  /**
   * DotPhrase (admin) shows the Admin view; Provider / Final Case Review roles
   * see the Library view. Mirrors the old portal's role → visibility matrix
   * (Admin/FCR/Provider/QA all see the entry; QA gets in through the Provider
   * claim they already carry).
   */
  dotPhraseAdmin: [
    NavClaims.dotPhrase,
    NavClaims.provider,
    NavClaims.finalCaseReview,
  ],
  cpt: [NavClaims.cptConfig],
  dbqAptTimes: [NavClaims.userManagement],
  clustersConfig: [NavClaims.userManagement],
  autoqueueAdmin: [NavClaims.autoQueueAdmin],
  organization: [NavClaims.viewOrganization, NavClaims.editOrganization],
  facilities: [NavClaims.viewFacility, NavClaims.editFacility],
  user: [NavClaims.viewProviderUser, NavClaims.editProviderUser],
  userDbqTraining: [NavClaims.editProviderUser],
  providerTrainingList: [NavClaims.userManagement],
  trainingUpload: [NavClaims.userManagement],
  providerDbqBurdenTime: [NavClaims.burdenTimeTemplate, NavClaims.editBurdenTime],
  holidayCalendarAdmin: [NavClaims.holidayCalendarAdmin],
  // Availability Calendar — ProviderCalendar/CalendarAdmin (admin) or ExaminerCalendar (provider).
  availabilityCalendar: [
    NavClaims.providerCalendar,
    NavClaims.calendarAdmin,
    NavClaims.examinerCalendar,
  ],
} as const;
