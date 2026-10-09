import React from "react";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Zap,
  BarChart3,
  Route,
} from "lucide-react";

import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <div className="home-grid"></div>
      <div className="home-orb home-orb-one"></div>
      <div className="home-orb home-orb-two"></div>
      <div className="home-orb home-orb-three"></div>

      <nav className="home-navbar">
        <a href="/" className="home-brand">
          <div className="home-brand-icon">
            <Brain size={21} />
          </div>
          <div>
            <strong>CareerAI</strong>
            <span>Career Intelligence</span>
          </div>
        </a>

        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>

        <div className="home-nav-actions">
          <a href="/login" className="login-link">
            Login
          </a>
          <a href="/register" className="nav-start-button">
            Get Started
            <ArrowRight size={15} />
          </a>
        </div>
      </nav>

      <main>
        <section className="home-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <Sparkles size={14} />
              AI-POWERED CAREER GUIDANCE
            </div>

            <h1>
              Your career.
              <br />
              <span>Intelligently guided.</span>
            </h1>

            <p className="hero-description">
              CareerAI analyzes your education, skills, interests and career
              goals to create a personalized path toward your future.
            </p>

            <div className="hero-buttons">
              <a href="/register" className="primary-hero-button">
                Start Your Assessment
                <ArrowRight size={18} />
              </a>
              <a href="#how-it-works" className="secondary-hero-button">
                See How It Works
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <CheckCircle2 size={15} />
                Personalized insights
              </div>
              <div className="trust-item">
                <CheckCircle2 size={15} />
                Skill-gap analysis
              </div>
              <div className="trust-item">
                <CheckCircle2 size={15} />
                Learning roadmap
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow"></div>
            <div className="orbit orbit-large"></div>
            <div className="orbit orbit-medium"></div>
            <div className="orbit orbit-small"></div>

            <div className="ai-core-large">
              <div className="core-inner">
                <Brain size={48} />
              </div>
            </div>

            <div className="visual-node visual-node-one">
              <Target size={19} />
              <span>Career</span>
            </div>
            <div className="visual-node visual-node-two">
              <BarChart3 size={19} />
              <span>Skills</span>
            </div>
            <div className="visual-node visual-node-three">
              <Route size={19} />
              <span>Roadmap</span>
            </div>
            <div className="visual-node visual-node-four">
              <Zap size={18} />
              <span>AI</span>
            </div>
          </div>
        </section>

        <section className="home-stats">
          <div className="stat-card">
            <Brain size={19} />
            <div>
              <strong>AI-Powered</strong>
              <span>Career Analysis</span>
            </div>
          </div>
          <div className="stat-card">
            <Target size={19} />
            <div>
              <strong>Personalized</strong>
              <span>Career Recommendations</span>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={19} />
            <div>
              <strong>Actionable</strong>
              <span>Skill Gap Insights</span>
            </div>
          </div>
          <div className="stat-card">
            <BookOpen size={19} />
            <div>
              <strong>Structured</strong>
              <span>Learning Roadmap</span>
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="section-intro">
            <div className="section-label">
              <span>01</span>
              FEATURES
            </div>
            <h2>
              Everything you need to
              <br />
              <span>navigate your career.</span>
            </h2>
            <p>
              CareerAI turns your personal profile into practical career
              intelligence.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-large">
              <div className="feature-icon">
                <Brain size={23} />
              </div>
              <div className="feature-number">01</div>
              <h3>AI Career Recommendations</h3>
              <p>
                Get career paths based on your education, current skills,
                interests and long-term career goals.
              </p>
              <div className="feature-mini">
                <span className="mini-dot"></span>
                Personalized to your profile
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple-icon">
                <TrendingUp size={23} />
              </div>
              <div className="feature-number">02</div>
              <h3>Skill Gap Analysis</h3>
              <p>
                Discover the skills you should learn next to move closer to your
                desired career.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange-icon">
                <BookOpen size={23} />
              </div>
              <div className="feature-number">03</div>
              <h3>Learning Roadmap</h3>
              <p>
                Follow a structured step-by-step learning path designed around
                your current level.
              </p>
            </div>

            <div className="feature-card feature-wide">
              <div className="feature-wide-content">
                <div className="feature-icon blue-icon">
                  <Target size={23} />
                </div>
                <div>
                  <div className="feature-number">04</div>
                  <h3>Career Goal Focused</h3>
                  <p>
                    Your career goal stays at the center of the analysis,
                    keeping recommendations relevant to the direction you want
                    to pursue.
                  </p>
                </div>
              </div>
              <div className="goal-visual">
                <div className="goal-line"></div>
                <div className="goal-circle">
                  <Target size={18} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="process-section">
          <div className="section-intro centered">
            <div className="section-label">
              <span>02</span>
              HOW IT WORKS
            </div>
            <h2>
              From profile to
              <br />
              <span>career direction.</span>
            </h2>
            <p>
              Three simple steps turn your information into an actionable career
              plan.
            </p>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <div className="process-number">01</div>
              <div className="process-icon">
                <Target size={23} />
              </div>
              <h3>Tell Us About You</h3>
              <p>
                Enter your education, GPA, skills, interests and desired career.
              </p>
              <div className="process-line"></div>
            </div>

            <div className="process-card">
              <div className="process-number">02</div>
              <div className="process-icon purple-process">
                <Brain size={23} />
              </div>
              <h3>AI Analyzes Your Profile</h3>
              <p>
                CareerAI processes your information and identifies relevant
                career paths and skill requirements.
              </p>
              <div className="process-line"></div>
            </div>

            <div className="process-card">
              <div className="process-number">03</div>
              <div className="process-icon orange-process">
                <Route size={23} />
              </div>
              <h3>Follow Your Roadmap</h3>
              <p>
                Receive a structured learning roadmap that helps you move toward
                your career goal.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="home-cta">
          <div className="cta-glow"></div>
          <div className="cta-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              YOUR NEXT STEP STARTS HERE
            </div>
            <h2>
              Stop guessing.
              <br />
              <span>Start building your path.</span>
            </h2>
            <p>
              Create your CareerAI profile and get a personalized analysis of
              where you are and where you can go.
            </p>
            <a href="/register" className="primary-hero-button">
              Create Your Career Profile
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="cta-visual">
            <div className="cta-ring ring-a"></div>
            <div className="cta-ring ring-b"></div>
            <div className="cta-core">
              <Sparkles size={29} />
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-brand">
          <div className="home-brand-icon">
            <Brain size={18} />
          </div>
          <div>
            <strong>CareerAI</strong>
            <span>AI Career Intelligence</span>
          </div>
        </div>
        <p>
          © {new Date().getFullYear()} CareerAI. Intelligent guidance for your
          career journey.
        </p>
      </footer>
    </div>
  );
};

export default Home;
