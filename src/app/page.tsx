import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Create Your Professional CV</h1>
          <p>Build a stunning CV that stands out from the crowd</p>
          <div className="hero-actions">
            <Link href={ROUTES.REGISTER} className="btn btn-primary">
              Get Started
            </Link>
            <Link href="/templates" className="btn btn-secondary">
              View Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose ApexCV?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Professional Templates</h3>
            <p>Choose from a variety of professionally designed templates</p>
          </div>
          <div className="feature-card">
            <h3>Easy to Use</h3>
            <p>Simple drag-and-drop interface for effortless CV creation</p>
          </div>
          <div className="feature-card">
            <h3>Export Options</h3>
            <p>Download your CV in multiple formats (PDF, DOCX)</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Choose a Template</h3>
            <p>Select from our collection of professional templates</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Fill in Your Details</h3>
            <p>Add your personal information, experience, and skills</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Download Your CV</h3>
            <p>Export your CV in your preferred format</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Create Your CV?</h2>
        <p>Join thousands of professionals who trust ApexCV</p>
        <Link href={ROUTES.REGISTER} className="btn btn-primary">
          Create Your CV Now
        </Link>
      </section>
    </div>
  );
}
