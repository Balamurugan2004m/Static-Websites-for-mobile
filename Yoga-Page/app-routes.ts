import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { paths } from "../constants/paths";
import { ACCESS } from "../constants/auth";
import { ActionPermissions } from "../constants/permissions";
import { NavClaims, SIDEBAR_ADMIN_ITEM_CLAIMS, SIDEBAR_REPORT_ITEM_CLAIMS } from "../constants/nav-claims";
import RouteScopeManager from "../components/routes-scope-manager";
import { WorkQueuePageSkeleton } from "../ui/work-queue-tab-skeleton";
import { AuthGuard } from "../components/auth/auth-guard";
import  NoticeGuard  from "../components/auth/notice-guard";
import LoginPage from "../pages/login/Login";
import WelcomeRegistration from "../pages/login/welcome-registration";
import ForgotPassword from "../pages/forgot-password/forgot-password";
import MfaMethodSelector from "../pages/login/mfa-method-selector";
import ForceSetPassword from "../pages/login/force-set-password";
import Notice from "../pages/login/Notice";
import TermsAndConditions from "../pages/terms-and-conditions/terms-and-conditions";
import EmailVerification from "../pages/login/email-mfa-verification";
import OtpValidation from "../pages/login/otp-validation";
import Home from "../pages/home/home";
import ProviderHome from "../pages/provider-home/provider-home";
import CaseSearch from "../pages/case-search/case-search";
import UnauthorizedPage from "../pages/unauthorized/unauthorized";
import PrivateLayout from "../layouts/private-layout/private-layout";
import CaseLayout from "../layouts/case-layout/case-layout";
import MDELayout from "../layouts/provider-layout/provider-layout";
import ExaminationNarratives from "../pages/provider-case-management/examination-narratives/examination-narratives";
import ContentionNarratives from "../pages/provider-case-management/contention-narratives/contention-narratives";
import ExistingDisabilities from "../pages/provider-case-management/existing-disabilities/existing-disabilities";
import OriginalCase from "../pages/provider-case-management/original-case/original-case";
import MedicalRecords from "../pages/provider-case-management/medical-records/medical-records";
// import TravelClaims from "../pages/provider-case-management/medical-opinion/medical-opinion";
import ClarificationHistory from "../pages/provider-case-management/clarification-history/clarification-history";
import AddDiagnostic from "../pages/provider-case-management/add-diagnostic/add-diagnostic";
import AdditionalDbqs from "../pages/provider-case-management/additional-dbqs/additional-dbqs";
import DbqDetailPage from "../pages/provider-case-management/questionnaire/dbq-detail-page";
import DbqPreview from "../pages/provider-case-management/questionnaire/dbq-preview";
import MedicalOpinion from "../pages/provider-case-management/medical-opinion/medical-opinion";
import ProviderExamHistory from "../pages/provider-case-management/exam-history/exam-history";
import SomethingWentWrongPage from "../pages/something-went-wrong/something-went-wrong";
import NotFoundPage from "../pages/not-found/not-found";
import AutoQueueAdmin from "../pages/auto-queue-admin/auto-queue";
import HolidayCalendar from "../pages/holiday-calendar/components/holiday-calendar";
import EsrTags from "../pages/esr-tags/esr-tags";
import DbqAptTimes from "../pages/dbq-apt-times/dbq-apt-times";
import ClustersConfig from "../pages/clusters-config/clusters-config";
import AccommodationConfig from "../pages/accommodation-config/accommodation-config";
import AccommodationConfigAdd from "../pages/accommodation-config/accommodation-config-add";
import OrganizationList from "../pages/provider-organization/organization-list";
import OrganizationDetails from "../pages/provider-organization/organization-details";
import OrganizationCreate from "../pages/provider-organization/organization-create";
import FacilityDetail from "../pages/provider-organization/components/facility-detail";
import ProviderTrainingUpload from "../pages/provider-training-upload/provider-training-upload";
import ProviderTrainingList from "../pages/provider-training-list/provider-training-list";
import ProviderDbqBurdenTime from "../pages/provider-dbq-burden-time/provider-dbq-burden-time";
import TemplateList from "../pages/provider-dbq-burden-time/templates/template-list";
import TemplateDetail from "../pages/provider-dbq-burden-time/templates/template-detail";
import TemplateCreate from "../pages/provider-dbq-burden-time/templates/template-create";
import ProviderBurdenTimeEdit from "../pages/provider-dbq-burden-time/provider-burden-time-edit";
import ReWork from "../pages/re-work/re-work";
import Invoice from "../pages/billing/invoice";
import LabNonLabPriceUpload from "../pages/billing/lab-and-non-lab-price-upload";
import BillingRateMaster from "../pages/billing/billing-rate-master";



const ProviderManagement = lazy(
    () => import("../pages/provider-management/provider-management")
);
const ProviderUserDetails = lazy(
    () =>
        import(
            "../pages/provider-users/provider-users-details/provider-users-details"
        )
);
const ProviderUsers = lazy(
    () => import("../pages/provider-users/provider-users/provider-users")
);

const AddFacility = lazy(() => import("../pages/provider-facility/add-facility"));
// const SmartQueue = lazy(() => import("../pages/provider-facility/smart-queue"));
const ViewEditFacility = lazy(() => import("../pages/provider-facility/view-edit-facility"));
const FacilityList = lazy(
    () => import("../pages/provider-facility/facility-list")
);
const UserDbqTrainingList = lazy(
    () => import("../pages/user-dbq-training/user-dbq-training-list")
);
const UserDbqTrainingDetails = lazy(
    () => import("../pages/user-dbq-training/user-dbq-training-details")
);
const UserRoles = lazy(() => import("../pages/user-roles/user-roles"));
const AddRoles = lazy(() => import("../pages/user-roles/add-roles"));
const EditUserRoles = lazy(() => import("../pages/user-roles/edit-roles"));
const CptConfig = lazy(() => import("../pages/Cpt_Config/Cptconfigpage"));

const ProviderCalendar = lazy(
    () => import("../pages/provider-calendar/provider-calendar")
);
const TermsOfService = lazy(
    () => import("../pages/terms-of-service/terms-of-service")
);
const Configuration = lazy(
    () => import("../pages/configuration/configuration")
);
const Billing = lazy(() => import("../pages/billing/billing"));
const AceEligible = lazy(
    () => import("../pages/case-search/exams/ace-eligible")
);
const AccountUserDetails = lazy(
    () => import("../pages/account-users/account-user-details")
);
const AddUser = lazy(() => import("../pages/account-users/add-user"));
const UserList = lazy(() => import("../pages/account-users/user-list"));

const AppointmentHistoryDetails = lazy(
    () =>
        import(
            "../pages/case-search/appointments/appointment-history-details/appointment-history-details"
        )
);
const CaseComments = lazy(
    () => import("../pages/case-search/case-notes/case-comments")
);
const ProviderCaseComments = lazy(
    () => import("../pages/provider-case-management/case-comments/case-comments")
);
const CaseHistory = lazy(
    () => import("../pages/case-search/audits/case-history")
);
const ClarificationDetails = lazy(
    () => import("../pages/case-search/clarifications/clarification-details")
);
const ClarificationReponseChangeHistory = lazy(
    () =>
        import(
            "../pages/case-search/clarifications/clarification-reponse-change-history"
        )
);
const Documents = lazy(
    () => import("../pages/case-search/documents/documents")
);
const Narrative = lazy(
    () => import("../pages/case-search/narratives/narrative")
);
const Audits = lazy(() => import("../pages/case-search/audits/audits"));
const Exams = lazy(() => import("../pages/case-search/audits/exams"));
const Appointments = lazy(
    () => import("../pages/case-search/appointments/appointments")
);
const Clarifications = lazy(
    () => import("../pages/case-search/clarifications/clarifications")
);
const VeteranTravel = lazy(
    () => import("../pages/case-search/veteran-travel/veteran-travel")
);
const ExamHistory = lazy(
    () => import("../pages/case-search/audits/exam-history")
);
const ExaminationNarrativeFromVA = lazy(
    () =>
        import(
            "../pages/case-search/narratives/examination-narrative-from-va"
        )
);
const ExistingDisabilitiesFromVA = lazy(
    () =>
        import(
            "../pages/case-search/existing-disabilities-from-va/existing-disabilities-from-va"
        )
);
const Mos = lazy(() => import("../pages/case-search/exams/mo/mo"));
const CasePriorityCaseProcessing = lazy(
    () =>
        import(
            "../pages/case-search/priority-case-processing/priority-case-processing"
        )
)
const QA = lazy(() => import("../pages/case-search/qa/qa"));
const FCR = lazy(() => import("../pages/case-search/fcr/fcr"));
const ProviderPriorityCaseProcessing = lazy(
    () =>
        import(
            "../pages/provider-case-management/priority-case-processing/priority-case-processing"
        )
);
const TravelClaimDetails = lazy(
    () =>
        import("../pages/case-search/veteran-travel/travel-claim-details")
);
const TravelAccordions = lazy(
    () =>
        import("../pages/case-search/veteran-travel/travel-accordions")
);

const EmailConfirmation = lazy(
    () => import("../pages/login/email-confirmation")
);
const CaseNotes = lazy(
    () => import("../pages/case-search/case-notes/case-notes")
);
const DotPhrase = lazy(
    () => import("../pages/dot-phrase/dot-phrase")
);
const TravelInstanceClaimReport = lazy(
    () => import("../pages/Veteran-Travel/TravelInstanceClaimReport")
);
const TravelPaymentUpload = lazy(
    () => import("../pages/Veteran-Travel/TravelPaymentUpload")
);
const WorkQueues = lazy(
    () => import("../pages/work-queues/work-queues")
);
const SystemAnnouncements = lazy(
    () => import("../pages/home/system-announcements/system-announcements")
);
const VAReports = lazy(() => import("../pages/va-reports/va-reports"));
const MonthlyReports = lazy(() => import("../pages/monthly-reports/monthly-reports"));
const ExamArchive = lazy(() => import("../pages/exam-archive/exam-archive"));

const LinkExpired = lazy(
    () => import("../pages/login/link-expired")
);

// helper for nested case routes: make child path relative using the paths file
const caseChildPath = (fullPath: string) =>
    fullPath.replace(`${paths.CASE_LAYOUT.pathName}/`, "");

const providerChildPath = (fullPath: string) =>
    fullPath.replace(`${paths.PROVIDER_LAYOUT.pathName}/`, "");

const AppRoutes = () => {
    return (
        <>
            <RouteScopeManager />
            <Routes>
                {/* Public / Auth routes */}
                {/* Root redirects to login; notice is shown as a modal inside the login page */}
                <Route path="/" element={<Navigate to={paths.LOGIN.pathName} replace />} />
                <Route path={paths.LOGIN.pathName} element={<LoginPage />} />
                <Route
                    path={paths.WELCOME_REGISTRATION.pathName}
                    element={<WelcomeRegistration />}
                />
                <Route path={paths.LINK_EXPIRED.pathName} element={<LinkExpired />} />
                <Route
                    path={paths.ForgotPassword.pathName}
                    element={<NoticeGuard><ForgotPassword /></NoticeGuard>}
                />
                <Route
                    path={paths.OTP_VALIDATION.pathName}
                    element={<NoticeGuard><OtpValidation /></NoticeGuard>}
                />
                <Route path={paths.MFA_METHOD.pathName} element={<NoticeGuard><MfaMethodSelector /></NoticeGuard>} />
                <Route
                    path={paths.EMAIL_VERIFICATION.pathName}
                    element={<NoticeGuard><EmailVerification /></NoticeGuard>}
                />
                <Route
                    path={paths.TERMS_AND_CONDITIONS.pathName}
                    element={<NoticeGuard><TermsAndConditions /></NoticeGuard>}
                />
                <Route
                    path={paths.TERMS_OF_SERVICE.pathName}
                    element={<NoticeGuard><TermsOfService /></NoticeGuard>}
                />
                <Route
                    path={paths.EMAIL_CONFIRMATION.pathName}
                    element={<EmailConfirmation />}
                />
                <Route
                    path={paths.FORCE_SET_PASSWORD.pathName}
                    element={<ForceSetPassword />}
                />
                <Route
                    path={paths.UNAUTHORIZED.pathName}
                    element={<UnauthorizedPage />}
                />
                <Route
                    path={paths.SOMETHING_WENT_WRONG.pathName}
                    element={<SomethingWentWrongPage />}
                />
                {/* Dedicated fallback pages kept public so redirects always resolve. */}
                <Route
                    path={paths.NOT_FOUND.pathName}
                    element={<NotFoundPage />}
                />

                {/* Protected routes */}
                <Route
                    element={
                        <AuthGuard>
                            <PrivateLayout />
                        </AuthGuard>
                    }
                >
                    <Route path={paths.HOME.pathName} element={<Home />} />
                    <Route
                        path={paths.WORK_QUEUES.pathName}
                        element={
                            <Suspense fallback={<WorkQueuePageSkeleton />}>
                                <WorkQueues />
                            </Suspense>
                        }
                    />
                    <Route path={paths.PROVIDER_HOME.pathName} element={<ProviderHome />} />
                    <Route path={paths.AUTO_QUEUE_ADMIN.pathName} element={<AutoQueueAdmin />} />
                    <Route path={paths.ESR_TAGS.pathName} element={<EsrTags />} />
                    <Route path={paths.DBQ_APT_TIMES.pathName} element={<DbqAptTimes />} />
                    <Route path={paths.CLUSTERS_CONFIG.pathName} element={<ClustersConfig />} />
                    <Route path={paths.ACCOMMODATION_CONFIG.pathName} element={<AccommodationConfig />} />
                    <Route path={paths.ACCOMMODATION_CONFIG_ADD.pathName} element={<AccommodationConfigAdd />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_ORG.pathName} element={<OrganizationList />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_ORG_CREATE.pathName} element={<OrganizationCreate />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_ORG_DETAILS.pathName} element={<OrganizationDetails />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_ORG_FACILITY.pathName} element={<FacilityDetail />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME.pathName} element={<ProviderDbqBurdenTime />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME_TEMPLATES.pathName} element={<TemplateList />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME_TEMPLATE_CREATE.pathName} element={<TemplateCreate />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME_TEMPLATE_DETAIL.pathName} element={<TemplateDetail />} />
                    <Route path={paths.PROVIDER_MANAGEMENT_DBQ_BURDEN_TIME_EDIT.pathName} element={<ProviderBurdenTimeEdit />} />
                    <Route path={paths.VBMS_INVOICE_FILES.pathName} element={<AuthGuard requiredRoles={["Admin", "Billing Manager", "Billing Staff"]}><Invoice /></AuthGuard>} />
                    <Route path={paths.LAB_NON_LAB_PRICE_UPLOAD.pathName} element={<AuthGuard requiredRoles={["Admin", "Billing Manager", "Billing Staff"]}><LabNonLabPriceUpload /></AuthGuard>} />
                    <Route path={paths.BILLING_RATE_MASTER.pathName} element={<AuthGuard requiredRoles={["Admin", "Billing Manager", "Billing Staff"]}><BillingRateMaster /></AuthGuard>} />
                    <Route
                        path={paths.SYSTEM_ANNOUNCEMENTS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: NavClaims.announcementsConfig, claimValue: ACCESS.ALLOWED },
                                ]}
                            >
                                <SystemAnnouncements />
                            </AuthGuard>
                        }
                    />
                    <Route path={paths.DOT_PHRASE.pathName} element={<DotPhrase />} />
                    <Route path={paths.DOT_PHRASE_ADMIN.pathName} element={<DotPhrase />} />
                    <Route
                        path={paths.VETERAN_TRAVEL.pathName}
                        element={<Navigate to={paths.TRAVEL_INSTANCE_CLAIM_REPORT.pathName} replace />}
                    />
                    <Route
                        path={paths.TRAVEL_INSTANCE_CLAIM_REPORT.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "VeteranTravelReimbursements", claimValue: "Allowed" },
                                ]}
                            >
                                <TravelInstanceClaimReport />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.TRAVEL_PAYMENT_UPLOAD.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "VeteranTravelReimbursements", claimValue: "Allowed" },
                                ]}
                            >
                                <TravelPaymentUpload />
                            </AuthGuard>
                        }
                    />
                    <Route path={paths.DBQ_BUILDER.pathName} element={<DbqPreview />} />

                    {/* Configuration */}
                    <Route
                        path={paths.CONFIGURATION.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "User Management", claimValue: "Allowed" },
                                ]}
                            >
                                <Configuration />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.USERS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "User Management", claimValue: "Allowed" },
                                ]}
                            >
                                <UserList />
                            </AuthGuard>
                        }
                    />

                    {/* Billing */}
                    <Route
                        path={paths.BILLING.pathName}
                        element={
                            <AuthGuard requiredRoles={["Admin", "Billing Manager", "Billing Staff"]}>
                                <Billing />
                            </AuthGuard>
                        }
                    />

                    {/* Reports — route claims match sidebar SIDEBAR_REPORT_ITEM_CLAIMS */}
                    <Route
                        path={paths.REPORTS.pathName}
                        element={
                            <AuthGuard
                                requireAnyClaim
                                requiredClaims={SIDEBAR_REPORT_ITEM_CLAIMS.vaReports.map(
                                    (claimType) => ({
                                        claimType,
                                        claimValue: ACCESS.ALLOWED,
                                    })
                                )}
                            >
                                <VAReports />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.MONTHLY_REPORTS.pathName}
                        element={
                            <AuthGuard
                                requireAnyClaim
                                requiredClaims={SIDEBAR_REPORT_ITEM_CLAIMS.monthlyReports.map(
                                    (claimType) => ({
                                        claimType,
                                        claimValue: ACCESS.ALLOWED,
                                    })
                                )}
                            >
                                <MonthlyReports />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.EXAM_ARCHIVE.pathName}
                        element={
                            <AuthGuard
                                requireAnyClaim
                                requiredClaims={SIDEBAR_REPORT_ITEM_CLAIMS.examArchive.map(
                                    (claimType) => ({
                                        claimType,
                                        claimValue: ACCESS.ALLOWED,
                                    })
                                )}
                            >
                                <ExamArchive />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.TRAVEL_REPORTS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "Allowed", claimValue: "User Management" },
                                ]}
                            >
                                <UserList />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.REWORK_REPORTS.pathName}
                        element={
                            <AuthGuard
                                requireAnyClaim
                                requiredClaims={SIDEBAR_REPORT_ITEM_CLAIMS.examArchive.map(
                                    (claimType) => ({
                                        claimType,
                                        claimValue: ACCESS.ALLOWED,
                                    })
                                )}
                            >
                                <ReWork />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.HOLIDAY_CALENDAR.pathName}
                        element={
                            <AuthGuard
                                requireAnyClaim
                                requiredClaims={SIDEBAR_ADMIN_ITEM_CLAIMS.holidayCalendarAdmin.map(
                                    (claimType) => ({
                                        claimType,
                                        claimValue: ACCESS.ALLOWED,
                                    })
                                )}
                            >
                                <HolidayCalendar />
                            </AuthGuard>
                        }
                    />

                    {/* Provider calendar — ProviderCalendar/CalendarAdmin (admin) or ExaminerCalendar (provider) */}
                    <Route
                        path={paths.PROVIDER_CALENDAR.pathName}
                        element={
                            <AuthGuard
                                requireAnyClaim
                                requiredClaims={[
                                    {
                                        claimType: "ProviderCalendar",
                                        claimValue: ACCESS.ALLOWED,
                                    },
                                    {
                                        claimType: "CalendarAdmin",
                                        claimValue: ACCESS.ALLOWED,
                                    },
                                    {
                                        claimType: "ExaminerCalendar",
                                        claimValue: ACCESS.ALLOWED,
                                    },
                                ]}
                            >
                                <ProviderCalendar />
                            </AuthGuard>
                        }
                    />

                    {/* Case search & case layout */}
                    <Route
                        path={paths.CASE_SEARCH.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: ActionPermissions.CASE_SEARCH,
                                        claimValue: ACCESS.ALLOWED,
                                    },
                                ]}
                            >
                                <CaseSearch />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path={paths.CASE_LAYOUT.pathName}
                        element={<CaseLayout />}
                    >
                        <Route path="case-details-screen" element={<></>} />
                        <Route
                            path={caseChildPath(paths.CASE_ACE_ELIGIBLE.pathName)}
                            element={<AceEligible />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_APPOINTMENT_HISTORY_DETAILS.pathName
                            )}
                            element={<AppointmentHistoryDetails />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_COMMENTS.pathName)}
                            element={<CaseComments />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_HISTORY.pathName)}
                            element={<CaseHistory />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_NOTES.pathName)}
                            element={<CaseNotes />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_CLARIFICATION_DETAILS.pathName
                            )}
                            element={<ClarificationDetails />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_CLARIFICATION_RESPONSE_CHANGE_HISTORY.pathName
                            )}
                            element={<ClarificationReponseChangeHistory />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_DOCUMENTS.pathName)}
                            element={<Documents />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_NARRATIVE.pathName)}
                            element={<Narrative />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_AUDITS.pathName)}
                            element={<Audits />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_EXAMS.pathName)}
                            element={<Exams />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_APPOINTMENTS.pathName)}
                            element={<Appointments />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_CLARIFICATIONS.pathName)}
                            element={<Clarifications />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_VETERAN_TRAVEL.pathName)}
                            element={<VeteranTravel />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_EXAM_HISTORY.pathName)}
                            element={<ExamHistory />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_EXAMINATION_NARRATIVE_FROM_VA.pathName
                            )}
                            element={<ExaminationNarrativeFromVA />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_EXISTING_DISABILITIES_FROM_VA.pathName
                            )}
                            element={<ExistingDisabilitiesFromVA />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_PRIORITY_CASE_PROCESSING.pathName
                            )}
                            element={<CasePriorityCaseProcessing />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_QA.pathName)}
                            element={<QA />}
                        />
                         <Route
                            path={caseChildPath(paths.CASE_FCR.pathName)}
                            element={<FCR />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_MOS.pathName)}
                            element={<Mos />}
                        />
                        <Route
                            path={caseChildPath(
                                paths.CASE_TRAVEL_CLAIM_DETAILS.pathName
                            )}
                            element={<TravelClaimDetails />}
                        />
                        <Route
                            path={caseChildPath(paths.CASE_TRAVEL_ACCORDIONS.pathName)}
                            element={<TravelAccordions />}
                        />
                    </Route>
                    <Route
                        path={paths.PROVIDER_LAYOUT.pathName}
                        element={<MDELayout />}
                    >
                        <Route
                            path={providerChildPath(paths.PROVIDER_EXAMINATION_NARRATIVES.pathName)}
                            element={<ExaminationNarratives />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_CONTENTION_NARRATIVES.pathName)}
                            element={<ContentionNarratives />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_EXISTING_DISABILITIES.pathName)}
                            element={<ExistingDisabilities />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_ORIGINAL_CASE_DBQ.pathName)}
                            element={<OriginalCase />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_PRIORITY_CASE_PROCESSING.pathName)}
                            element={<ProviderPriorityCaseProcessing />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_MEDICAL_RECORDS.pathName)}
                            element={<MedicalRecords />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_MEDICAL_OPINION_QUESTIONS_FROM_VA.pathName)}
                            element={<MedicalOpinion />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_EXAM_HISTORY.pathName)}
                            element={<ProviderExamHistory />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_CLARIFICATION_HISTORY.pathName)}
                            element={<ClarificationHistory />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_CASE_COMMENTS.pathName)}
                            element={<ProviderCaseComments />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_ADD_DIAGNOSTIC.pathName)}
                            element={<AddDiagnostic />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_ADDITIONAL_DBQS.pathName)}
                            element={<AdditionalDbqs />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_QUESTIONNAIRE.pathName)}
                            element={<DbqDetailPage />}
                        />
                        <Route
                            path={providerChildPath(paths.PROVIDER_QUESTIONNAIRE_PREVIEW.pathName)}
                            element={<DbqPreview />}
                        />
                        {/* Additional MDE routes can be added here */}
                    </Route>
                    {/* Configuration > Users details/create */}
                    <Route
                        path={paths.USER_DETAILS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "User Management", claimValue: "Allowed" },
                                ]}
                            >
                                <AccountUserDetails />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.USER_CREATE.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: "User Management", claimValue: "Allowed" },
                                ]}
                            >
                                <AddUser />
                            </AuthGuard>
                        }
                    />

                    {/* Configuration > DOTPhrase Admin */}
                    <Route
                        path={paths.DOT_PHRASE_ADMIN.pathName}
                        element={<DotPhrase />}
                    />

                    {/* Configuration > Roles list/create/edit */}
                    <Route
                        path={paths.ROLE_EDIT.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "Role Management and Definition",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <EditUserRoles />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.ROLE_CREATE.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "Role Management and Definition",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <AddRoles />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.ROLES.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "Role Management and Definition",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <UserRoles />
                            </AuthGuard>
                        }
                    />

                    {/* Provider Management */}
                    <Route
                        path={paths.PROVIDER_MANAGEMENT.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "ViewProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <ProviderManagement />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_USERS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "ViewProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <ProviderUsers />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_USER_DETAILS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "ViewProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <ProviderUserDetails />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_USER_CREATE.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "ViewProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <ProviderUserDetails />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.CPT_CONFIG.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    { claimType: ActionPermissions.CPT_CONFIG, claimValue: "Allowed" },
                                ]}
                            >
                                <CptConfig />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_FACILITIES.pathName}
                        element={<FacilityList />}
                    />
                    <Route path="/provider-management/facilities/add" element={<AddFacility />} />
                    <Route path="/provider-management/facilities/:facilityId" element={<ViewEditFacility />} />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_USER_DBQ_TRAINING.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "EditProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <UserDbqTrainingList />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_USER_DBQ_TRAINING_CREATE.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "EditProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <UserDbqTrainingDetails />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path={paths.PROVIDER_MANAGEMENT_USER_DBQ_TRAINING_DETAILS.pathName}
                        element={
                            <AuthGuard
                                requiredClaims={[
                                    {
                                        claimType: "EditProviderUserInformation",
                                        claimValue: "Allowed",
                                    },
                                ]}
                            >
                                <UserDbqTrainingDetails />
                            </AuthGuard>
                        }
                    />
                    {/* <Route path="/provider-management/smart-queue/:facilityId" element={<SmartQueue />} /> */}
                    <Route path="/provider-management/provider-training-list" element={<ProviderTrainingList />} />
                    <Route path="/provider-management/provider-training-upload" element={<ProviderTrainingUpload />} />
                </Route>

                {/* Redirect and 404 */}
                <Route
                    path={paths.INDEX.pathName}
                    element={<Navigate to={paths.HOME.pathName} replace />}
                />
                <Route
                    path="*"
                    // Any unmatched URL resolves to a stable 404 route.
                    element={<Navigate to={paths.NOT_FOUND.pathName} replace />}
                />
            </Routes>
        </>
    );
};

export default AppRoutes;
