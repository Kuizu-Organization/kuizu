import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../../api/class';
import { Button } from '../../components/ui';
import { Users, File, Calendar, Share2, MoreVertical } from 'lucide-react';
import './ClassDetailPage.css';

const ClassDetailPage = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                setIsLoading(true);
                const data = await getClassDetails(classId);
                setClassData(data);
            } catch (err) {
                console.error("Failed to load class details:", err);
                setError("Failed to load class details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassDetails();
    }, [classId]);

    if (isLoading) {
        return (
            <div className="class-detail-loading">
                <div className="spinner"></div>
                <p>Loading class details...</p>
            </div>
        );
    }

    if (error || !classData) {
        return (
            <div className="class-detail-error">
                <h2>Oops! Something went wrong.</h2>
                <p>{error || "Class not found."}</p>
                <Button variant="primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="class-detail-container">
            <header className="class-header-section">
                <div className="class-header-content">
                    <div className="class-badges">
                        <span className="badge badge-primary">Class</span>
                    </div>
                    <h1 className="class-title">{classData.className}</h1>
                    <p className="class-owner">Created by <strong>{classData.ownerDisplayName}</strong></p>
                    
                    <div className="class-actions">
                        <Button variant="primary" className="action-btn">
                            <Users size={18} />
                            <span>Join Class</span>
                        </Button>
                        <Button variant="outline" className="action-btn-icon">
                            <Share2 size={18} />
                        </Button>
                        <Button variant="ghost" className="action-btn-icon">
                            <MoreVertical size={18} />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="class-main-content">
                <div className="class-sidebar">
                    <section className="class-info-card">
                        <h3>About this class</h3>
                        <p className="class-description">{classData.description || "No description provided."}</p>
                        
                        <div className="class-meta-list">
                            <div className="meta-item">
                                <Users size={16} />
                                <span>Members</span>
                            </div>
                            <div className="meta-item">
                                <File size={16} />
                                <span>{classData.classMaterials ? classData.classMaterials.length : 0} Materials</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="class-materials-list">
                    <div className="materials-header">
                        <h2>Class Materials</h2>
                        <Button variant="outline" size="sm">Add Material</Button>
                    </div>
                    
                    {classData.classMaterials && classData.classMaterials.length > 0 ? (
                        <div className="materials-grid">
                            {classData.classMaterials.map(material => (
                                <div key={material.materialId} className="material-card">
                                    <div className="material-icon">
                                        <File size={24} />
                                    </div>
                                    <div className="material-info">
                                        <h4 className="material-title">{material.materialType}</h4>
                                        <p className="material-ref">ID: {material.materialRefId}</p>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-materials">
                            <File size={48} className="empty-icon" />
                            <h3>No materials yet</h3>
                            <p>This class doesn't have any study materials assigned to it.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClassDetailPage;
