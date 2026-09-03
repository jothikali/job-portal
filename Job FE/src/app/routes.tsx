import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { JobListings } from "./pages/JobListings";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { CandidateProfile } from "./pages/CandidateProfile";
import { PostJob } from "./pages/PostJob";
import Auth from "./pages/Auth";
import { JobApplication } from "./pages/JobApplication";
import CompanyReviews from "./pages/CompanyReviews";
import MyJobs from './pages/MyJobs';
import AdminDashboard from './components/Admin/AdminDashboard';
import { AdminJobs } from "./components/Admin/AdminJobs";
import ManageJobs from './components/Admin/ManageJobs';
import Applications from './components/Admin/Applications';
import { Profile } from "./components/Profile/Profile";
import EditContact from './components/Profile/EditContact';
import Qualifications from './components/Profile/Qualifications';
import JobPreferences from "./components/Profile/JobPreferences";
import ReadyToWork from "./components/Profile/ReadyToWork";
import EditSummary from './components/Profile/EditSummary';
import AptitudePage from "./components/Interview/AptitudePage";
import AdminReview from "./components/Admin/AdminReview";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/",       element: <Home /> },
  { path: "/home",   element: <JobListings /> },
  // Both /login and /signup resolve to the same sliding Auth component
  { path: "/login",  element: <Auth /> },
  { path: "/signup", element: <Auth /> },
  { path: "/auth",   element: <Auth /> },
  { path: "/profile", element: <Profile /> },
  { path: "/reviews", element: <CompanyReviews /> },

  // Candidate / Job Seeker Routes
  { path: "/candidate/:id", element: <CandidateProfile /> },
  { path: "/apply/:jobId",  element: <JobApplication /> },
  { path: "/my-jobs",       element: <MyJobs /> },
  { path: "/edit-contact",  element: <EditContact /> },
  { path: "/edit-summary",  element: <EditSummary /> },
  { path: "/qualifications", element: <Qualifications /> },
  { path: "jobs",           element: <ManageJobs /> },
  { path: "/preferences",   element: <JobPreferences /> },
  { path: "/ready-to-work", element: <ReadyToWork /> },
  { path: "/aptitude-test/:id", element: <AptitudePage /> },

  // Admin / Recruiter Dashboard (Nested)
  {
    path: "/admin",
    element: <AdminDashboard />,
    children: [
      { index: true,          element: <RecruiterDashboard /> },
      { path: "review",       element: <AdminReview /> },
      { path: "applications", element: <Applications /> },
      { path: "jobs",         element: <ManageJobs /> },
      { path: "post-job",     element: <PostJob /> },
    ]
  },
  { path: "/dashboard", element: <RecruiterDashboard /> },
]);