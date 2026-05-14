import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { JobListings } from "./pages/JobListings";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { CandidateProfile } from "./pages/CandidateProfile";
import { PostJob } from "./pages/PostJob";
import { Login } from "./pages/Login";
import { Signup } from './pages/Signup';
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
// --- NEW IMPORT ---
import EditSummary from './components/Profile/EditSummary';
import AptitudePage from "./components/Interview/AptitudePage";
import AdminReview from "./components/Admin/AdminReview";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/", element: <Home /> },
  { path: "/home", element: <JobListings /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/profile", element: <Profile /> },
  { path: "/reviews", element: <CompanyReviews /> },

  // Candidate / Job Seeker Routes
  { path: "/candidate/:id", element: <CandidateProfile /> },
  { path: "/apply/:jobId", element: <JobApplication /> },
  { path: "/my-jobs", element: <MyJobs /> },
  { path: "/edit-contact", element: <EditContact /> },

  // --- ADDED THIS ROUTE ---
  { path: "/edit-summary", element: <EditSummary /> },
  { path: "/qualifications", element: <Qualifications /> },

  { path: "jobs", element: <ManageJobs /> },

  { path: "/preferences", element: <JobPreferences /> },
  { path: "/ready-to-work", element: <ReadyToWork /> },
 { path: "/aptitude-test/:id", element: <AptitudePage /> },

  // Admin / Recruiter Dashboard (The Nested Part)
  {
    path: "/admin",
    element: <AdminDashboard />, 
    children: [
      {
        index: true, // Idhu '/admin' path-ku mattum dhaan work aaganum
        element: <RecruiterDashboard />
      },
      {
        path: "review", // Relative path: '/admin/review'
        element: <AdminReview />
      },
      {
        path: "applications",
        element: <Applications />
      },
      {
        path: "jobs",
        element: <ManageJobs />
      },
      {
        path: "post-job",
        element: <PostJob />
      },
    ]
  },
  // Recruiter specific route (if separate)
  { path: "/dashboard", element: <RecruiterDashboard /> },
]);