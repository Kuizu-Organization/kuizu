import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import { BookOpen, Brain, Users, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <Navbar />

            <main className="home-content">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-container">
                        <div className="hero-badge">
                            <Sparkles size={14} className="sparkle-icon" />
                            <span>Revolutionize Your Study Habits</span>
                        </div>
                        <h1 className="hero-title">
                            Master any subject with <span className="gradient-text">Kuizu</span>
                        </h1>
                        <p className="hero-subtitle">
                            The most effective way to learn, practice, and master anything. Join thousands of students using AI-powered flashcards and interactive tests.
                        </p>
                        <div className="hero-actions">
                            <Button
                                variant="primary"
                                size="lg"
                                className="cta-button"
                                onClick={() => window.location.href = '/auth'}
                                rightIcon={<ArrowRight size={20} />}
                            >
                                Get Started for Free
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="demo-button"
                            >
                                View Demo
                            </Button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">50k+</span>
                                <span className="stat-label">Active Students</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">1M+</span>
                                <span className="stat-label">Flashcards Created</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">98%</span>
                                <span className="stat-label">Success Rate</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="visual-card main-card">
                            <div className="card-header">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                            <div className="card-content-skeleton">
                                <div className="skeleton-line title"></div>
                                <div className="skeleton-line body"></div>
                                <div className="skeleton-line body short"></div>
                            </div>
                        </div>
                        <div className="visual-card floating-card-1">
                            <div className="icon-box purple">
                                <Brain size={24} />
                            </div>
                            <span>Active Recall</span>
                        </div>
                        <div className="visual-card floating-card-2">
                            <div className="icon-box blue">
                                <CheckCircle2 size={24} />
                            </div>
                            <span>95% Correct</span>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="section-header">
                        <h2 className="section-title">Everything you need to excel</h2>
                        <p className="section-subtitle">Powerful tools designed to help students learn faster and remember longer.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Brain className="feature-icon" />
                            </div>
                            <h3>Smart Flashcards</h3>
                            <p>Our spaced-repetition algorithm adapts to your learning pace, focusing on what you need to study most.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <BookOpen className="feature-icon" />
                            </div>
                            <h3>Interactive Tests</h3>
                            <p>Generate practice tests from your study sets to simulate real exam conditions and build confidence.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Users className="feature-icon" />
                            </div>
                            <h3>Study Groups</h3>
                            <p>Collaborate with classmates, share study sets, and compete on leaderboards to stay motivated.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bottom-cta-section">
                    <div className="cta-card">
                        <h2>Ready to boost your grades?</h2>
                        <p>Join Kuizu today and start your journey towards academic excellence.</p>
                        <Button
                            variant="white"
                            size="lg"
                            onClick={() => window.location.href = '/auth'}
                        >
                            Create Your Account
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
