import { createBrowserRouter } from "react-router-dom";
import { Home }             from "./pages/Home";
import { JobListings }      from "./pages/JobListings";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { CandidateProfile } from "./pages/CandidateProfile";
import { PostJob }          from "./pages/PostJob";
import { Login }            from "./pages/Login";
import { Signup }           from "./pages/Signup";
import Auth                 from "./pages/Auth";
import { JobApplication }   from "./pages/JobApplication";
import CompanyReviews       from "./pages/CompanyReviews";
import MyJobs               from "./pages/MyJobs";
import AdminDashboard       from "./components/Admin/AdminDashboard";
import { AdminJobs }        from "./components/Admin/AdminJobs";
import ManageJobs           from "./components/Admin/ManageJobs";
import Applications         from "./components/Admin/Applications";
import { Profile }          from "./components/Profile/Profile";
import EditContact          from "./components/Profile/EditContact";
import Qualifications       from "./components/Profile/Qualifications";
import JobPreferences       from "./components/Profile/JobPreferences";
import ReadyToWork          from "./components/Profile/ReadyToWork";
import EditSummary          from "./components/Profile/EditSummary";
import AptitudePage         from "./components/Interview/AptitudePage";
import AdminReview          from "./components/Admin/AdminReview";

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────────────────
  { path: "/",        element: <Home /> },
  { path: "/home",    element: <JobListings /> },

  // Full-screen split layout (same design as Home page)
  { path: "/login",   element: <Login /> },
  { path: "/signup",  element: <Signup /> },

  // Sliding card variant — still available at /auth
  { path: "/auth",    element: <Auth /> },

  // ── Candidate ────────────────────────────────────────────────────────────
  { path: "/profile",           element: <Profile /> },
  { path: "/reviews",           element: <CompanyReviews /> },
  { path: "/candidate/:id",     element: <CandidateProfile /> },
  { path: "/apply/:jobId",      element: <JobApplication /> },
  { path: "/my-jobs",           element: <MyJobs /> },
  { path: "/edit-contact",      element: <EditContact /> },
  { path: "/edit-summary",      element: <EditSummary /> },
  { path: "/qualifications",    element: <Qualifications /> },
  { path: "/preferences",       element: <JobPreferences /> },
  { path: "/ready-to-work",     element: <ReadyToWork /> },
  { path: "/aptitude-test/:id", element: <AptitudePage /> },

  // ── Admin (nested) ───────────────────────────────────────────────────────
  {
    path: "/admin",
    element: <AdminDashboard />,
    children: [
      { index: true,          element: <RecruiterDashboard /> },
      { path: "review",       element: <AdminReview /> },
      { path: "applications", element: <Applications /> },
      { path: "jobs",         element: <ManageJobs /> },
      { path: "post-job",     element: <PostJob /> },
    ],
  },

  { path: "/dashboard", element: <RecruiterDashboard /> },
]);
