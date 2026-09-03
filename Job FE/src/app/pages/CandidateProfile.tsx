import { API } from '../lib/api';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Download,
  Calendar,
  GraduationCap,
} from 'lucide-react';

// 1. Interfaces for Type Safety
interface Experience {
  id: string | number;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  id: string | number;
  degree: string;
  institution: string;
  year: string;
}

interface Candidate {
  id: string;
  name: string;
  title: string; // role
  email: string;
  phone: string;
  location: string;
  summary: string; // about
  skills: string | string[];
  experience: string | Experience[];
  education: string | Education[];
}

export function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Fetch Data from MySQL API
  useEffect(() => {
    fetch(`${API}/candidates/${id}`)
      .then((res) => res.json())
      .then((data: Candidate) => {
        setCandidate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching candidate profile:", err);
        setLoading(false);
      });
  }, [id]);

  // JSON Parsing Helper (டேட்டாபேஸில் இருந்து வரும் String-ஐ Array-ஆக மாற்ற)
  const parseData = (data: any) => {
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data || '[]');
    } catch {
      return [];
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Candidate Not Found</h1>
          <Link to="/dashboard" className="text-accent hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const experiences = parseData(candidate.experience);
  const educationList = parseData(candidate.education);
  const skillsList = parseData(candidate.skills);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground py-4 px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="size-6" />
            <span className="font-bold text-xl">JobPortal</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <Link to="/jobs" className="hover:text-accent transition-colors">Find Jobs</Link>
            <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-8 shadow-sm">
              <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent/20">
                <span className="text-4xl font-bold text-accent">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-center mb-2">{candidate.name}</h1>
              <p className="text-center text-muted-foreground mb-6 font-medium">{candidate.title}</p>

              {/* Contact Info */}
              <div className="space-y-4 mb-8 border-y py-6 border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-accent" />
                  <span className="break-all text-muted-foreground">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 text-accent" />
                  <span className="text-muted-foreground">{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 text-accent" />
                  <span className="text-muted-foreground">{candidate.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-accent text-accent-foreground py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-bold shadow-sm">
                  <Download className="size-4" />
                  Download Resume
                </button>
                <button className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg hover:opacity-90 transition-all font-bold">
                  Contact Candidate
                </button>
              </div>

              {/* Skills */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-accent/5 text-accent border border-accent/10 px-3 py-1 rounded-md text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Professional Summary</h2>
              <p className="text-muted-foreground leading-relaxed italic">"{candidate.summary}"</p>
            </div>

            {/* Experience Timeline */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-8">Work Experience</h2>
              <div className="space-y-8">
                {experiences.map((exp: Experience) => (
                  <div key={exp.id} className="relative pl-8 border-l-2 border-accent/20 last:border-l-0 pb-2">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-accent rounded-full border-4 border-background" />

                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{exp.title}</h3>
                        <p className="text-accent font-medium">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="size-4" />
                        <span>{exp.period}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-8">Education</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {educationList.map((edu: Education) => (
                  <div key={edu.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl">
                    <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                      <GraduationCap className="size-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs font-bold text-accent mt-2">Graduated: {edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="flex-1 min-w-[150px] bg-accent text-accent-foreground py-4 rounded-xl hover:shadow-lg transition-all font-bold">
                Shortlist
              </button>
              <button className="flex-1 min-w-[150px] bg-primary text-primary-foreground py-4 rounded-xl hover:shadow-lg transition-all font-bold">
                Schedule Interview
              </button>
              <button className="px-8 bg-destructive/10 text-destructive py-4 rounded-xl hover:bg-destructive hover:text-white transition-all font-bold">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}