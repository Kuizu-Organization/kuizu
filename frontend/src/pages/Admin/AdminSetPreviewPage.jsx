import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Badge } from '../../components/ui';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import MainLayout from '../../components/layout';
import './AdminSetPreviewPage.css';

const AdminSetPreviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setId } = useParams();
    
    // Pass the set data via location state, or you could fetch it using the setId
    // assuming it is passed from the table or modal.
    const selectedSet = location.state?.selectedSet;

    if (!selectedSet) {
        return (
            <MainLayout activePath="/admin/submissions/flashcards">
                <div className="p-8 text-center text-slate-500">
                    Flashcard set not found. <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4">Go Back</Button>
                </div>
            </MainLayout>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <MainLayout activePath="/admin/submissions/flashcards">
            <div className="admin-set-preview-container">
                <header className="preview-header-nav">
                    <Button variant="ghost" className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Back to Submissions
                    </Button>
                </header>

                <Card className="preview-main-card">
                    <div className="preview-header-section">
                        <div className="header-info-main">
                            <div className="type-icon-wrapper">
                                <BookOpen size={30} />
                            </div>
                            <div className="title-area">
                                <h1 className="set-title">{selectedSet.title}</h1>
                                <div className="set-meta">
                                    <Badge variant="primary">{selectedSet.visibility}</Badge>
                                    <span className="submission-date">
                                        <Clock size={14} /> Submitted {formatDate(selectedSet.submittedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="author-card">
                            <label className="section-label">SUBMITTED BY</label>
                            <div className="author-info-flex">
                                <div className="author-avatar-circle">
                                    {selectedSet.ownerDisplayName?.charAt(0)}
                                </div>
                                <div className="author-text">
                                    <span className="author-name">{selectedSet.ownerDisplayName}</span>
                                    <span className="author-handle">@{selectedSet.ownerUsername}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedSet.description && (
                        <div className="preview-description-section">
                            <label className="section-label">DESCRIPTION</label>
                            <div className="description-bubble">
                                <p>{selectedSet.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="preview-content-section mt-10">
                        <div className="section-header">
                            <h2 className="section-heading">Flashcards ({selectedSet.flashcards?.length || 0})</h2>
                        </div>
                        
                        <div className="flashcard-grid">
                            {selectedSet.flashcards && selectedSet.flashcards.length > 0 ? (
                                selectedSet.flashcards.map((card, idx) => (
                                    <div key={card.cardId || idx} className="flashcard-item-card">
                                        <div className="card-column">
                                            <label className="column-label">TERM</label>
                                            <div className="column-content term-text">{card.term}</div>
                                        </div>
                                        <div className="card-split-divider"></div>
                                        <div className="card-column">
                                            <label className="column-label">DEFINITION</label>
                                            <div className="column-content definition-text">{card.definition}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-cards-placeholder">
                                    <p>This set has no cards to review.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

export default AdminSetPreviewPage;
