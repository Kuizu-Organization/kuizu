import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader } from 'lucide-react';
import './FlashcardSetForm.css';
import { getFlashcardSetById, createFlashcardSet, updateFlashcardSet } from '../api/flashcards';
import { Button, Card, Input } from '../components/ui';
import MainLayout from '../components/layout';

const FlashcardSetForm = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!setId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'PUBLIC'
    });
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit) {
            fetchSet();
        }
    }, [setId]);

    const fetchSet = async () => {
        try {
            const data = await getFlashcardSetById(setId);
            setFormData({
                title: data.title,
                description: data.description || '',
                visibility: data.visibility || 'PUBLIC'
            });
        } catch (err) {
            setError('Failed to load set data');
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
        try {
            setSubmitting(true);
            setError(null);

            if (isEdit) {
                await updateFlashcardSet(setId, formData);
                navigate(`/flashcard-sets/${setId}`);
            } else {
                const newSet = await createFlashcardSet(formData);
                navigate(`/flashcard-sets/${newSet.setId}`);
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
                    <h1>{isEdit ? 'Edit Flashcard Set' : 'Create New Set'}</h1>
                </div>

                {loading ? (
                    <div className="center"><Loader /></div>
                ) : (
                    <Card className="form-card">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-msg">{error}</div>}

                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder='e.g. "Biology 101: Cell Structure"'
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description (Optional)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Add a bio to your profile..."
                                    className="custom-textarea"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="visibility">Visibility</label>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    className="custom-select"
                                    value={formData.visibility}
                                    onChange={handleChange}
                                >
                                    <option value="PUBLIC">Public (Everyone can see)</option>
                                    <option value="PRIVATE">Private (Only you can see)</option>
                                    <option value="UNLISTED">Unlisted (Anyone with the link can see)</option>
                                </select>
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
                                    {submitting ? <Loader size="sm" /> : <><Save size={18} /> {isEdit ? 'Save Changes' : 'Create Set'}</>}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
};

export default FlashcardSetForm;
