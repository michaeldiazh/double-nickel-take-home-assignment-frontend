import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Happy Hauler Trucking Co</h1>
        
        <div className="button-group">
          <Link to="/sign-up" className="home-button">
            New Applicant?
          </Link>
          <Link to="/login" className="home-button secondary">
            Existing Applicant?
          </Link>
        </div>
      </div>
    </div>
  );
}
