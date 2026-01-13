import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { deleteJobApplication, getAllJobs, getUserData } from '../services/api';
import { Job, ConversationSummary } from '../types';
import { useError } from '../hooks/useError';
import { API_BASE_URL } from '../utils/constants';

type TabType = 'new' | 'applied';

interface JobRowProps {
  job: Job;
  onClick: (jobId: string) => void;
}

function JobRow({ job, onClick }: JobRowProps) {
  return (
    <tr className="job-row" onClick={() => onClick(job.id)}>
      <td>{job.jobName}</td>
      <td>{job.jobDescription}</td>
      <td>{job.jobLocation}</td>
      <td>
        <span className="active-status">
          <span className={`status-dot ${job.isActive ? 'active' : 'inactive'}`} />
          {job.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout ,setUser} = useAuth();
  const { error, setError } = useError();
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    if(user?.id){
      const newUser = await getUserData(user?.id);
      setUser(newUser);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch all jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await getAllJobs();
        setAllJobs(jobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [setError]);

  useEffect(() => {

  })

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleJobClick = useCallback(async (jobId: string) => {
    // Check if user has already applied to this job
    const userJob = user?.jobApplications?.find(application => application.jobId === jobId);
    
    if (userJob) {
      const confirmed = window.confirm(
        'You have already applied to this position. Do you want to start a new session?'
      );
      
      if (!confirmed) {
        return;
      }
      
      // Delete the existing application if it has an ID
      if (userJob.applicationId) {
        try {
          await deleteJobApplication(userJob.applicationId);
          // Wait for backend to process deletion
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error('Failed to delete application:', err);
        }
      }
    }
    
    // Navigate to chat
    navigate(`/chat?jobId=${jobId}`);
  }, [user?.jobApplications, navigate]);

  const handleApplicationClick = useCallback(async (applicationId: string, screeningDecision: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/conversation`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Conversation not found for this application');
          return;
        }
        throw new Error('Failed to fetch conversation summary');
      }

      const conversationData = await response.json();
      
      // Map snake_case response to camelCase ConversationSummary
      // The API returns: screening_decision, screening_summary, application_id
      // We need: screeningDecision, screeningSummary, applicationId
      const summary: ConversationSummary = {
        applicationId: conversationData.application_id || applicationId,
        screeningDecision: conversationData.screening_decision || screeningDecision.toUpperCase(),
        screeningSummary: conversationData.screening_summary || null,
      };
      
      // Navigate to summary page with the summary data
      navigate('/summary', {
        state: summary,
      });
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    }
  }, [navigate, setError]);

  if (!user) {
    return null;
  }

  const appliedJobs = user.jobApplications || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="tabs">
          <button
            className={activeTab === 'new' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('new')}
          >
            New Jobs
          </button>
          <button
            className={activeTab === 'applied' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('applied')}
          >
            Applied Jobs
          </button>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading">Loading jobs...</div>
        ) : (
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Job Description</th>
                  <th>Job Location</th>
                  <th>{activeTab === 'new' ? 'Is Active' : 'App Status'}</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'new' ? (
                  allJobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="no-data">No jobs available</td>
                    </tr>
                  ) : (
                    allJobs.map((job) => (
                      <JobRow key={job.id} job={job} onClick={handleJobClick} />
                    ))
                  )
                ) : (
                  appliedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="no-data">No applications yet</td>
                    </tr>
                  ) : (
                    appliedJobs.map((app, idx) => (
                      <tr 
                        key={idx} 
                        className="job-row"
                        onClick={() => handleApplicationClick(app.applicationId, app.screeningDecision)}
                      >
                        <td>{app.jobName}</td>
                        <td>{app.jobDescription}</td>
                        <td>{app.jobLocation}</td>
                        <td>
                          <span className={`status-badge ${app.screeningDecision.toLowerCase()}`}>
                            {app.screeningDecision}
                          </span>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
