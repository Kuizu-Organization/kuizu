import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Badge, Textarea, Loader, Table, EmptyState } from '@/components/ui';
import { ArrowLeft, BookOpen, Clock, CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout';
import { approveFlashcardSet, rejectFlashcardSet } from '@/api/moderation';
import { useToast } from '@/context/ToastContext';
import './AdminSetPreviewPage.css';

const AdminSetPreviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setId } = useParams();
    const toast = useToast();

    const selectedSet = location.state?.selectedSet;

    const [moderationNotes, setModerationNotes] = useState('');
    const [isProcessingModeration, setIsProcessingModeration] = useState(false);

    if (!selectedSet) {
        return (
            <MainLayout activePath="/admin/submissions/flashcards">
                <div className="admin-set-preview-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
                    <EmptyState
                        icon={AlertCircle}
                        title="Flashcard set not found"
                        description="The requested flashcard set could not be found or has already been moderated."
                        action={<Button onClick={() => navigate(-1)} variant="primary">Go Back to Submissions</Button>}
                    />
                </div>
            </MainLayout>
        );
    }

    const handleModeration = async (action) => {
        try {
            setIsProcessingModeration(true);
            if (action === 'APPROVE') {
                await approveFlashcardSet(selectedSet.setId, moderationNotes);
            } else {
                await rejectFlashcardSet(selectedSet.setId, moderationNotes);
            }
            toast.success(`Flashcard set ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
            navigate('/admin/submissions/flashcards');
        } catch (error) {
            toast.error(`Failed to ${action === 'APPROVE' ? 'approve' : 'reject'} flashcard set`);
        } finally {
            setIsProcessingModeration(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <MainLayout activePath="/admin/submissions/flashcards">
            <div className="admin-set-preview-container">

                {/* Breadcrumb / back nav */}
                <div className="preview-breadcrumb">
                    <Button variant="ghost" className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={15} /> Back to Submissions
                    </Button>
                </div>

                {/* Two-column layout */}
                <div className="preview-layout">

                    {/* ── Main content ── */}
                    <div className="preview-main-content">
                        <Card className="preview-main-card">

                            {/* Card header: title + meta + author */}
                            <div className="preview-card-header">
                                <div className="preview-card-header-left">
                                    <div className="type-icon-wrapper">
                                        <BookOpen size={22} />
                                    </div>
                                    <div className="preview-title-group">
                                        <h1 className="preview-set-title">{selectedSet.title}</h1>
                                        <div className="preview-set-meta">
                                            <Badge variant="primary">{selectedSet.visibility}</Badge>
                                            <span className="submission-date">
                                                <Clock size={12} /> Submitted {formatDate(selectedSet.submittedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Author pill */}
                                <div className="author-pill">
                                    <div className="author-avatar-circle">
                                        {selectedSet.ownerDisplayName?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="author-text">
                                        <span className="author-name">{selectedSet.ownerDisplayName}</span>
                                        <span className="author-handle">@{selectedSet.ownerUsername}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedSet.description && (
                                <div className="preview-description-section">
                                    <label className="section-label">Description</label>
                                    <div className="description-bubble">
                                        <p>{selectedSet.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Flashcards list */}
                            <div className="preview-content-section">
                                <div className="section-header">
                                    <span className="section-heading">Flashcards</span>
                                    <span className="flashcard-count-badge">
                                        {selectedSet.flashcards?.length || 0} cards
                                    </span>
                                </div>

                                <div className="flashcard-list-wrapper">
                                    <Table
                                        columns={['Term', 'Definition']}
                                        data={selectedSet.flashcards}
                                        emptyTitle="No flashcards found"
                                        emptyDescription="This set has no cards to review."
                                        emptyIcon={BookOpen}
                                        renderRow={(card, idx) => (
                                            <tr key={card.cardId || idx}>
                                                <td className="term-cell-content">
                                                    <span className="term-text font-bold">{card.term}</span>
                                                </td>
                                                <td className="definition-cell-content">
                                                    <p className="definition-text">{card.definition}</p>
                                                </td>
                                            </tr>
                                        )}
                                    />
                                </div>
                            </div>

                        </Card>
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="preview-sidebar">
                        <Card className="moderation-card">
                            <div className="moderation-card-header">
                                <MessageSquare size={17} />
                                <h3>Moderation</h3>
                            </div>
                            <div className="moderation-card-body">
                                <div className="moderation-notes-area">
                                    <label className="section-label">Feedback Notes</label>
                                    <Textarea
                                        placeholder="Provide a reason for approval or rejection (optional)..."
                                        value={moderationNotes}
                                        onChange={(e) => setModerationNotes(e.target.value)}
                                        rows={6}
                                        className="moderation-textarea"
                                    />
                                </div>
                                <div className="moderation-actions">
                                    <Button
                                        variant="success"
                                        className="action-button approve"
                                        onClick={() => handleModeration('APPROVE')}
                                        disabled={isProcessingModeration}
                                    >
                                        {isProcessingModeration
                                            ? <Loader size="xs" />
                                            : <><CheckCircle size={16} /> Approve Set</>
                                        }
                                    </Button>
                                    <Button
                                        variant="error"
                                        className="action-button reject"
                                        onClick={() => handleModeration('REJECT')}
                                        disabled={isProcessingModeration}
                                    >
                                        {isProcessingModeration
                                            ? <Loader size="xs" />
                                            : <><XCircle size={16} /> Reject Set</>
                                        }
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </aside>

                </div>
            </div>
        </MainLayout>
    );
};

export default AdminSetPreviewPage;
