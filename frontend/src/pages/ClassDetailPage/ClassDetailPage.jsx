import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails, leaveClass, getClassJoinCode } from '../../api/class';
import { Button } from '../../components/ui';
import { Users, File, Calendar, Share2, MoreVertical, Copy, Check } from 'lucide-react';
import JoinClassModal from '../../components/Class/JoinClassModal';
import LeaveClassModal from '../../components/Class/LeaveClassModal';
import './ClassDetailPage.css';

const ClassDetailPage = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [localIsMember, setLocalIsMember] = useState(false); // Can be evaluated based on response later
    const [isLeaving, setIsLeaving] = useState(false);
    const [joinCode, setJoinCode] = useState(null);
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGetJoinCode = async () => {
        if (joinCode) {
            handleCopyCode(joinCode);
            return;
        }

        try {
            setIsLoadingCode(true);
            const data = await getClassJoinCode(classId);
            setJoinCode(data.joinCode);
            handleCopyCode(data.joinCode);
        } catch (err) {
            console.error("Failed to fetch join code:", err);
            alert("Failed to fetch join code.");
        } finally {
            setIsLoadingCode(false);
        }
    };

    const handleCopyCode = (code) => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleJoinSuccess = (joinedInstantly) => {
        if (joinedInstantly) {
            setLocalIsMember(true);
        }
    };

    const handleLeaveClass = async () => {
        try {
            setIsLeaving(true);
            await leaveClass(classId);
            setIsLeaveModalOpen(false);
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to leave class:", err);
            alert("Failed to leave the class. Please try again.");
            setIsLeaving(false);
        }
    };

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
                        {(classData?.isOwner || classData?.isMember || localIsMember) && (
                            <Button
                                variant="outline"
                                className="action-btn"
                                onClick={handleGetJoinCode}
                                disabled={isLoadingCode}
                            >
                                {isLoadingCode ? (
                                    <span>...</span>
                                ) : joinCode ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>{joinCode}</span>
                                        {copied ? <Check size={16} style={{ color: '#48bb78' }} /> : <Copy size={16} />}
                                    </div>
                                ) : (
                                    <>
                                        <Share2 size={18} />
                                        <span>Join Code</span>
                                    </>
                                )}
                            </Button>
                        )}

                        {(!classData?.isOwner && !classData?.isMember && !localIsMember) && (
                            <Button variant="primary" className="action-btn" onClick={() => setIsJoinModalOpen(true)}>
                                <Users size={18} />
                                <span>Join Class</span>
                            </Button>
                        )}
                        {(!classData?.isOwner && (classData?.isMember || localIsMember)) && (
                            <Button variant="outline" className="action-btn text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => setIsLeaveModalOpen(true)} disabled={isLeaving}>
                                <Users size={18} />
                                <span>{isLeaving ? 'Leaving...' : 'Leave Class'}</span>
                            </Button>
                        )}
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

            <JoinClassModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                classId={classId}
                onJoinSuccess={handleJoinSuccess}
            />

            <LeaveClassModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleLeaveClass}
                isLeaving={isLeaving}
            />
        </div>
    );
};

export default ClassDetailPage;
