import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Save, Loader } from 'lucide-react';
import './FlashcardForm.css';
import { getFlashcardById, createFlashcard, updateFlashcard } from '../api/flashcards';
import { Button, Card, Input } from '../components/ui';
import MainLayout from '../components/layout';

const FlashcardForm = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const setId = queryParams.get('setId');

    const isEdit = !!cardId;

    const [formData, setFormData] = useState({
        term: '',
        definition: '',
        orderIndex: 0
    });
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit) {
            fetchCard();
        }
    }, [cardId]);

    const fetchCard = async () => {
        try {
            const data = await getFlashcardById(cardId);
            setFormData({
                term: data.term,
                definition: data.definition,
                orderIndex: data.orderIndex || 0
            });
        } catch (err) {
            setError('Failed to load flashcard data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!setId && !isEdit) {
            setError('Missing Set ID');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            if (isEdit) {
                const updated = await updateFlashcard(cardId, formData);
                navigate(`/flashcard-sets/${updated.setId}`);
            } else {
                await createFlashcard(setId, formData);
                navigate(`/flashcard-sets/${setId}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="form-container">
                <button className="back-link" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                    Cancel
                </button>

                <div className="form-header">
                    <h1>{isEdit ? 'Edit Flashcard' : 'Add New Flashcard'}</h1>
                </div>

                {loading ? (
                    <div className="center"><Loader /></div>
                ) : (
                    <Card className="form-card">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-msg">{error}</div>}

                            <div className="form-group">
                                <label htmlFor="term">Term</label>
                                <Input
                                    id="term"
                                    name="term"
                                    placeholder="Enter the concept or word..."
                                    value={formData.term}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="definition">Definition</label>
                                <textarea
                                    id="definition"
                                    name="definition"
                                    rows="4"
                                    placeholder="Enter the explanation..."
                                    className="custom-textarea"
                                    value={formData.definition}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="orderIndex">Order Index (Optional)</label>
                                <Input
                                    id="orderIndex"
                                    name="orderIndex"
                                    type="number"
                                    value={formData.orderIndex}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-actions">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="submit-btn"
                                >
                                    {submitting ? <Loader size="sm" /> : <><Save size={18} /> {isEdit ? 'Save Card' : 'Add Card'}</>}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
};

export default FlashcardForm;
