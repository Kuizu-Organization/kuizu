import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Footer } from '../../components/layout';
import { Button, Card, Loader, EmptyState, ItemCard } from '../../components/ui';
import { BookOpen, Brain, Users, Sparkles, ArrowRight, CheckCircle2, Globe, FolderOpen } from 'lucide-react';
import { getSuggestedClasses } from '../../api/class';
import { getPublicFolders } from '../../api/folder';
import { getSuggestedSets } from '../../api/flashcardSet';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [publicFolders, setPublicFolders] = useState([]);
    const [suggestedSets, setSuggestedSets] = useState([]);
    const [suggestedClasses, setSuggestedClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExploreData = async () => {
            try {
                setIsLoading(true);
                const [folders, sets, classes] = await Promise.all([
                    getPublicFolders(),
                    getSuggestedSets(4),
                    getSuggestedClasses(4)
                ]);

                setPublicFolders(folders);
                setSuggestedSets(sets);
                setSuggestedClasses(classes);
            } catch (error) {
                console.error("Failed to fetch explore data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExploreData();
    }, []);

    const handleClassClick = (classId) => {
        navigate(`/classes/${classId}`);
    };

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
                                onClick={() => navigate('/auth')}
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
                                <div className="stat-icon-wrapper blue">
                                    <Users size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-number">50k+</span>
                                    <span className="stat-label">Active Students</span>
                                </div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-icon-wrapper purple">
                                    <BookOpen size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-number">1M+</span>
                                    <span className="stat-label">Flashcards Created</span>
                                </div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-icon-wrapper green">
                                    <Sparkles size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-number">98%</span>
                                    <span className="stat-label">Success Rate</span>
                                </div>
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

                    <div className="features-grid-home">
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

                {/* Explore Section */}
                <section className="explore-section">
                    <div className="explore-container">
                        <div className="section-header">
                            <h2 className="section-title">Explore Kuizu</h2>
                            <p className="section-subtitle">Discover public flashcard sets, classes, and folders created by our community.</p>
                        </div>

                        {isLoading ? (
                            <div className="explore-loader">
                                <Loader />
                            </div>
                        ) : (
                            <div className="explore-content">
                                {/* Suggested Flashcard Sets */}
                                <div className="explore-subsection">
                                    <div className="explore-subsection-header">
                                        <h3>
                                            <div className="subsection-icon sets">
                                                <BookOpen size={20} />
                                            </div>
                                            Suggested Flashcard Sets
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={() => navigate('/search?q=')}>Explore all</Button>
                                    </div>
                                    {suggestedSets.length > 0 ? (
                                        <div className="explore-grid">
                                            {suggestedSets.map(set => (
                                                <ItemCard
                                                    key={set.setId}
                                                    onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                                    title={set.title}
                                                    badge="Set"
                                                    description={set.description || 'No description provided.'}
                                                    footerText={`${set.flashcardCount} terms • by ${set.ownerDisplayName}`}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState description="No suggested sets available yet." />
                                    )}
                                </div>

                                {/* Suggested Classes */}
                                <div className="explore-subsection">
                                    <div className="explore-subsection-header">
                                        <h3>
                                            <div className="subsection-icon classes">
                                                <Users size={20} />
                                            </div>
                                            Suggested Classes
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={() => navigate('/search?q=')}>Explore all</Button>
                                    </div>
                                    {suggestedClasses.length > 0 ? (
                                        <div className="explore-grid">
                                            {suggestedClasses.map(cls => (
                                                <ItemCard
                                                    key={cls.classId}
                                                    onClick={() => handleClassClick(cls.classId)}
                                                    title={cls.className}
                                                    badge="Class"
                                                    description={cls.description || 'No description provided.'}
                                                    footerText={`by ${cls.ownerDisplayName}`}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState description="No suggested classes available yet." />
                                    )}
                                </div>

                                {/* Suggested Folders */}
                                {publicFolders.length > 0 && (
                                    <div className="explore-subsection">
                                        <div className="explore-subsection-header">
                                            <h3>
                                                <div className="subsection-icon folders">
                                                    <FolderOpen size={20} />
                                                </div>
                                                Suggested Folders
                                            </h3>
                                            <Button variant="ghost" size="sm" onClick={() => navigate('/search?q=')}>Explore all</Button>
                                        </div>
                                        <div className="explore-grid">
                                            {publicFolders.slice(0, 4).map(folder => (
                                                <ItemCard
                                                    key={folder.folderId}
                                                    onClick={() => navigate(`/folders/${folder.folderId}`)}
                                                    title={folder.name}
                                                    badge="Folder"
                                                    description={folder.description || 'No description provided.'}
                                                    footerText={`${folder.setCount} sets • by ${folder.ownerDisplayName}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bottom-cta-section">
                    <div className="cta-container">
                        <div className="cta-card">
                            <h2>Ready to boost your grades?</h2>
                            <p>Join Kuizu today and start your journey towards academic excellence.</p>
                            <Button
                                variant="white"
                                size="lg"
                                onClick={() => navigate('/auth')}
                            >
                                Create Your Account
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
