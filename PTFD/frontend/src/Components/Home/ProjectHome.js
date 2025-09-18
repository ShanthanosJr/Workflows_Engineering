import React, { useEffect, useState } from "react";
import "./ConstructionHome.css";

const ConstructionHome = () => {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    document.querySelectorAll("[id]").forEach((el) => {
      if (el.id) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const constructionTypes = [
    { name: "Residential", icon: "🏠", desc: "Homes & Communities" },
    { name: "Commercial", icon: "🏢", desc: "Offices & Retail" },
    { name: "Industrial", icon: "🏭", desc: "Manufacturing & Warehouses" },
    { name: "Infrastructure", icon: "🌉", desc: "Roads & Bridges" },
    { name: "Renovation", icon: "🔨", desc: "Upgrades & Modernization" },
    { name: "Green", icon: "🌱", desc: "Sustainable Projects" },
  ];

  const stats = [
    { icon: "📈", value: "7.3%", label: "Annual Growth" },
    { icon: "👥", value: "14.4M", label: "Jobs Created" },
    { icon: "💰", value: "$2T", label: "Market Size by 2030" },
    { icon: "🏆", value: "500+", label: "Projects Completed" },
  ];

  const features = [
    {
      icon: "🛡️",
      title: "Advanced Safety",
      desc: "AI-powered safety monitoring and real-time hazard detection systems.",
    },
    {
      icon: "📅",
      title: "Smart Timeline",
      desc: "Dynamic project scheduling with predictive analytics and milestone tracking.",
    },
    {
      icon: "💰",
      title: "Budget Control",
      desc: "Comprehensive financial dashboard with cost optimization insights.",
    },
    {
      icon: "🎯",
      title: "Quality Assurance",
      desc: "Automated quality checks and compliance monitoring throughout projects.",
    },
  ];

  return (
    <div className="construction-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-animation">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>

        <div className="hero-content">
          <div
            className={`hero-inner ${isVisible.hero ? "visible" : ""}`}
            id="hero"
          >
            <div className="hero-badge">
              <span className="badge-icon">🏗️</span>
              Next-Generation Construction Platform
            </div>

            <h1 className="hero-title">
              Build <span className="gradient-text">Smarter</span>
              <br />
              With <span className="gradient-text-alt">Intelligence</span>
            </h1>

            <p className="hero-subtitle">
              Revolutionary AI-powered construction workflow and safety
              management system that transforms how you build, monitor, and
              deliver projects.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary">Start Building →</button>
              <button className="btn btn-secondary">▶ Watch Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="intro-section">
        <div className="container">
          <div className="intro-grid">
            <div
              className={`intro-text ${isVisible.intro ? "visible" : ""}`}
              id="intro"
            >
              <h2 className="section-title">
                The Future of <span className="gradient-text">Construction</span>
              </h2>
              <p className="section-description">
                We're revolutionizing the construction industry with cutting-edge
                AI technology, predictive analytics, and smart automation. Our
                platform delivers unparalleled efficiency, safety, and quality
                across every project phase.
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-dot blue"></div>
                  <span>AI-powered project optimization</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot indigo"></div>
                  <span>Real-time safety monitoring</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot purple"></div>
                  <span>Predictive maintenance systems</span>
                </div>
              </div>
              <button className="btn btn-outline">Explore Our Process</button>
            </div>

            <div className="intro-image">
              <div className="image-container">
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop"
                  alt="Modern Construction"
                />
                <div className="image-badge">🏗️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div
            className={`section-header ${isVisible.features ? "visible" : ""}`}
            id="features"
          >
            <h2 className="section-title">Intelligent Solutions</h2>
            <p className="section-description">
              Experience the power of AI-driven construction management with our
              comprehensive suite of intelligent tools.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${isVisible.features ? "visible" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types */}
      <section className="types-section">
        <div className="container">
          <div
            className={`section-header ${isVisible.types ? "visible" : ""}`}
            id="types"
          >
            <h2 className="section-title">Construction Expertise</h2>
            <p className="section-description">
              From residential homes to industrial complexes, we deliver
              excellence across all construction sectors.
            </p>
          </div>

          <div className="types-grid">
            {constructionTypes.map((type, index) => (
              <div
                key={index}
                className={`type-card ${isVisible.types ? "visible" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="type-icon">{type.icon}</div>
                <h3 className="type-title">{type.name}</h3>
                <p className="type-desc">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div
            className={`section-header ${isVisible.stats ? "visible" : ""}`}
            id="stats"
          >
            <h2 className="section-title">Industry Leadership</h2>
            <p className="section-description">
              The construction industry is experiencing unprecedented growth,
              and we're at the forefront of this transformation.
            </p>
          </div>

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`stat-card ${isVisible.stats ? "visible" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="showcase-section">
        <div className="container">
          <div
            className={`section-header ${isVisible.showcase ? "visible" : ""}`}
            id="showcase"
          >
            <h2 className="section-title">Project Excellence</h2>
            <p className="section-description">
              Discover our latest achievements and innovative construction
              solutions.
            </p>
          </div>

          <div className="showcase-grid">
            {[
              "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1549924231-f129b911e442?w=600&h=400&fit=crop",
            ].map((url, index) => (
              <div
                key={index}
                className={`showcase-item ${isVisible.showcase ? "visible" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img src={url} alt={`Project ${index + 1}`} />
                <div className="showcase-overlay">
                  <div className="showcase-content">
                    <h3>Project {index + 1}</h3>
                    <p>Excellence in Construction</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg-animation">
          <div className="floating-orb cta-orb-1"></div>
          <div className="floating-orb cta-orb-2"></div>
        </div>

        <div className="container">
          <div
            className={`cta-content ${isVisible.cta ? "visible" : ""}`}
            id="cta"
          >
            <h2 className="cta-title">Ready to Build the Future?</h2>
            <p className="cta-subtitle">
              Partner with us for your next construction project and experience
              the power of intelligent building solutions.
            </p>

            <div className="cta-buttons">
              <button className="btn btn-primary">Start Your Project →</button>
              <button className="btn btn-secondary">Contact Our Team</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">
                <span className="brand-icon">🏗️</span>
                <span className="brand-name">Workflows Engineering</span>
              </div>
              <p className="brand-tagline">Building Tomorrow, Today</p>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} Workflows Engineering. All Rights
              Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConstructionHome;
