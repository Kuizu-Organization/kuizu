import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { BookOpen, Sparkles, Shield, Rocket, ArrowRight } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="logo" onClick={() => navigate('/')}>Kuizu</div>
                <div className="header-actions">
                    {user ? (
                        <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => navigate('/auth')}>Log in</Button>
                            <Button onClick={() => navigate('/auth')}>Sign up</Button>
                        </>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="badge"><Sparkles size={16} /> The future of learning</div>
                    <h1>Master any subject with <span>Kuizu</span></h1>
                    <p>
                        The most modern flashcard platform designed for students who want to study
                        smarter, not harder. Beautiful, efficient, and completely synced with your workflow.
                    </p>
                    <div className="hero-btns">
                        <Button size="lg" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
                            {user ? 'Go to Dashboard' : 'Start studying for free'} <ArrowRight size={20} />
                        </Button>
                        <Button variant="outline" size="lg">Explore Library</Button>
                    </div>
                </div>
                <div className="hero-visual">
                    {/* Mock illustration/visual */}
                    <div className="visual-card visual-card-1">
                        <BookOpen size={40} />
                        <div className="visual-line"></div>
                        <div className="visual-line short"></div>
                    </div>
                    <div className="visual-card visual-card-2">
                        <Rocket size={40} />
                    </div>
                    <div className="hero-glow"></div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="feature">
                    <div className="feature-icon"><BookOpen size={24} /></div>
                    <h3>Smart Sets</h3>
                    <p>Organize your flashcards into beautiful, intuitive sets and folders.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon"><Shield size={24} /></div>
                    <h3>Private & Secure</h3>
                    <p>Your data is yours. We prioritize your privacy and account security.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon"><Rocket size={24} /></div>
                    <h3>Fast Performance</h3>
                    <p>No more waiting. Load your sets instantly across all your devices.</p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
