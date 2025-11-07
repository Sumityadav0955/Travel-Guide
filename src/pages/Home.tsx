// Home page component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import '../styles/home.css';

const Home: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Hidden Gems with Locals</h1>
          <p className="hero-subtitle">
            Explore authentic, off-the-beaten-path destinations recommended by people who know them best
          </p>
          <div className="hero-actions">
            {state.isAuthenticated ? (
              <>
                <Button onClick={() => navigate('/search')}>
                  Explore Locations
                </Button>
                <Button variant="secondary" onClick={() => navigate('/submit-location')}>
                  Share a Hidden Gem
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button variant="secondary" onClick={() => navigate('/search')}>
                  Browse Locations
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Offbeat Travel?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Local Recommendations</h3>
            <p>Discover places that only locals know about, away from tourist crowds</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Authentic Reviews</h3>
            <p>Read genuine experiences from travelers who've been there</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Connect with Locals</h3>
            <p>Message locals directly to get insider tips and personalized advice</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Community</h3>
            <p>Join a community of travelers and locals sharing hidden gems worldwide</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Sign up as a traveler or local and join our community</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Discover or Share</h3>
            <p>Browse hidden gems or share your local favorites</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect & Explore</h3>
            <p>Message locals, read reviews, and plan your adventure</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Explore?</h2>
          <p>Join thousands of travelers discovering authentic experiences</p>
          {!state.isAuthenticated && (
            <Button onClick={() => navigate('/register')}>
              Join Now - It's Free
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;