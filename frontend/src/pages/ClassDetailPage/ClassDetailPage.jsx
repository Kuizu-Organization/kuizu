import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails, leaveClass, getClassJoinCode, deleteClass, removeMember, processJoinRequest, removeClassMaterial, reRequestClassReview } from '@/api/class';
import { Button } from '@/components/ui';
import { Users, File, Calendar, Share2, MoreVertical, Copy, Check, Trash2, Folder, Layers } from 'lucide-react';
import JoinClassModal from '@/components/Class/JoinClassModal';
import LeaveClassModal from '@/components/Class/LeaveClassModal';
import EditClassModal from '@/components/Class/EditClassModal';
import DeleteClassModal from '@/components/Class/DeleteClassModal';
import RemoveMemberModal from '@/components/Class/RemoveMemberModal';
import AddClassMaterialModal from '@/components/Class/AddClassMaterialModal';
import RemoveMaterialModal from '@/components/Class/RemoveMaterialModal';
import { useToast } from '@/context/ToastContext';
import './ClassDetailPage.css';

const ClassDetailPage = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [classData, setClassData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
    const [isRemoveMaterialModalOpen, setIsRemoveMaterialModalOpen] = useState(false);
    const [localIsMember, setLocalIsMember] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isRemovingMaterial, setIsRemovingMaterial] = useState(false);
    const [isReRequesting, setIsReRequesting] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [joinCode, setJoinCode] = useState(null);
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('materials');

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

    const handleDeleteClass = async () => {
        try {
            setIsDeleting(true);
            await deleteClass(classId);
            setIsDeleteModalOpen(false);
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to delete class:", err);
            alert("Failed to delete the class. Please try again.");
            setIsDeleting(false);
        }
    };

    const handleReRequestReview = async () => {
        try {
            setIsReRequesting(true);
            await reRequestClassReview(classId);
            addToast('Review requested successfully!', 'success');

            // Re-fetch class details
            const data = await getClassDetails(classId);
            setClassData(data);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to request review', 'error');
        } finally {
            setIsReRequesting(false);
        }
    };

    const handleRemoveMemberClick = (member) => {
        setSelectedMember(member);
        setIsRemoveModalOpen(true);
    };

    const handleRemoveMemberConfirm = async () => {
        if (!selectedMember) return;

        try {
            setIsRemoving(true);
            await removeMember(classId, selectedMember.userId);

            // Update local state
            setClassData(prev => ({
                ...prev,
                members: prev.members.filter(m => m.userId !== selectedMember.userId)
            }));

            setIsRemoveModalOpen(false);
            setSelectedMember(null);
        } catch (err) {
            console.error("Failed to remove member:", err);
            alert("Failed to remove the member. Please try again.");
        } finally {
            setIsRemoving(false);
        }
    };

    const handleProcessJoinRequest = async (requestId, status) => {
        try {
            await processJoinRequest(classId, requestId, status);

            // Find the request to get user info if accepted
            const request = classData.joinRequests.find(r => r.requestId === requestId);

            // Update local state
            setClassData(prev => {
                const updatedRequests = prev.joinRequests.filter(r => r.requestId !== requestId);
                let updatedMembers = prev.members;

                if (status === 'ACCEPTED' && request) {
                    const newMember = {
                        userId: request.userId,
                        displayName: request.displayName,
                        role: 'MEMBER',
                        joinedAt: new Date().toISOString()
                    };
                    updatedMembers = [...prev.members, newMember];
                }

                return {
                    ...prev,
                    joinRequests: updatedRequests,
                    members: updatedMembers
                };
            });
        } catch (err) {
            console.error(`Failed to ${status.toLowerCase()} join request:`, err);
            alert(`Failed to ${status.toLowerCase()} the join request. Please try again.`);
        }
    };

    const handleRemoveMaterialClick = (material) => {
        setSelectedMaterial(material);
        setIsRemoveMaterialModalOpen(true);
    };

    const handleRemoveMaterialConfirm = async () => {
        if (!selectedMaterial) return;

        try {
            setIsRemovingMaterial(true);
            await removeClassMaterial(classId, selectedMaterial.materialId);
            setClassData(prev => ({
                ...prev,
                classMaterials: prev.classMaterials.filter(m => m.materialId !== selectedMaterial.materialId)
            }));
            setIsRemoveMaterialModalOpen(false);
            setSelectedMaterial(null);
        } catch (err) {
            console.error("Failed to remove material:", err);
            alert("Failed to remove material from class. Please try again.");
        } finally {
            setIsRemovingMaterial(false);
        }
    };

    const handleMaterialAdded = (newMaterial) => {
        setClassData(prev => ({
            ...prev,
            classMaterials: [...(prev.classMaterials || []), newMaterial]
        }));
    };

    const handleUpdateSuccess = (updatedClass) => {
        setClassData(updatedClass);
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
                        {classData.status === 'PENDING' && (
                            <span className="badge" style={{ backgroundColor: '#eab308', color: 'black', marginLeft: '8px' }}>Pending Review</span>
                        )}
                        {classData.status === 'REJECTED' && (
                            <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', marginLeft: '8px' }}>Rejected</span>
                        )}
                        {classData.status === 'ACTIVE' && classData.isOwner && (
                            <span className="badge" style={{ backgroundColor: '#22c55e', color: 'white', marginLeft: '8px' }}>Approved</span>
                        )}
                    </div>
                    <h1 className="class-title">{classData.className}</h1>
                    {classData.status === 'REJECTED' && classData.moderationNotes && (
                        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', maxWidth: '600px' }}>
                            <h4 style={{ color: '#991b1b', margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>Moderator Feedback:</h4>
                            <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.9rem' }}>{classData.moderationNotes}</p>
                        </div>
                    )}
                    <p className="class-owner">Created by <strong>{classData.ownerDisplayName}</strong></p>

                    <div className="class-actions">
                        {classData?.isOwner && classData?.status === 'REJECTED' && (
                            <Button
                                variant="outline"
                                className="action-btn text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                onClick={handleReRequestReview}
                                isLoading={isReRequesting}
                            >
                                <span>Request Review Again</span>
                            </Button>
                        )}
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
                        {classData?.isOwner && (
                            <>
                                <Button variant="outline" className="action-btn" onClick={() => setIsEditModalOpen(true)}>
                                    <Share2 size={18} />
                                    <span>Edit Class</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="action-btn text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                </Button>
                            </>
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

                <div className="class-content-area">
                    {classData?.isOwner && (
                        <div className="class-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                                onClick={() => setActiveTab('materials')}
                            >
                                <File size={18} />
                                <span>Materials</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                                onClick={() => setActiveTab('members')}
                            >
                                <Users size={18} />
                                <span>Members</span>
                                <span className="tab-count">{classData.members?.length || 0}</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                                onClick={() => setActiveTab('requests')}
                            >
                                <Calendar size={18} />
                                <span>Join Requests</span>
                                {classData.joinRequests?.length > 0 && (
                                    <span className="tab-badge">{classData.joinRequests.length}</span>
                                )}
                            </button>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="class-materials-list">
                            <div className="materials-header">
                                <h2>Class Materials</h2>
                                {classData?.isOwner && (
                                    <Button variant="outline" size="sm" onClick={() => setIsAddMaterialModalOpen(true)}>Add Material</Button>
                                )}
                            </div>

                            {classData.classMaterials && classData.classMaterials.length > 0 ? (
                                <div className="materials-grid">
                                    {classData.classMaterials.map(material => {
                                        const isFolder = material.materialType === 'FOLDER';
                                        return (
                                            <div key={material.materialId} className="material-card">
                                                <div className="material-icon">
                                                    {isFolder ? <Folder size={32} /> : <Layers size={32} />}
                                                </div>
                                                <div className="material-info">
                                                    <h4 className="material-title">{material.materialName || material.materialType}</h4>
                                                    <p className="material-ref">{isFolder ? 'Folder' : 'Flashcard Set'}</p>
                                                </div>
                                                <div className="material-actions" style={{ display: 'flex', gap: '8px' }}>
                                                    <Button variant="outline" size="sm" onClick={() => navigate(isFolder ? `/folders/${material.materialRefId}` : `/flashcard-sets/${material.materialRefId}`)}>View</Button>
                                                    {classData?.isOwner && (
                                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleRemoveMaterialClick(material)}>Remove</Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-materials">
                                    <File size={48} className="empty-icon" />
                                    <h3>No materials yet</h3>
                                    <p>This class doesn't have any study materials assigned to it.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="class-members-list">
                            <div className="members-header">
                                <h2>Class Members</h2>
                            </div>
                            <div className="members-grid">
                                {classData.members?.map(member => (
                                    <div key={member.userId} className="member-card">
                                        <div className="member-avatar">
                                            {member.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="member-info">
                                            <h4 className="member-name">{member.displayName}</h4>
                                            <span className={`member-role ${member.role.toLowerCase()}`}>{member.role}</span>
                                        </div>
                                        {member.userId !== classData.ownerUserId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleRemoveMemberClick(member)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="class-requests-list">
                            <div className="requests-header">
                                <h2>Join Requests</h2>
                            </div>
                            {classData.joinRequests?.length > 0 ? (
                                <div className="requests-container">
                                    {classData.joinRequests.map(request => (
                                        <div key={request.requestId} className="request-card">
                                            <div className="request-user">
                                                <div className="user-avatar">
                                                    {request.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <h4 className="user-name">{request.displayName}</h4>
                                                    <p className="request-time">Requested {new Date(request.requestedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {request.message && (
                                                <div className="request-message">
                                                    <p>"{request.message}"</p>
                                                </div>
                                            )}
                                            <div className="request-actions">
                                                <Button variant="primary" size="sm" onClick={() => handleProcessJoinRequest(request.requestId, 'ACCEPTED')}>Accept</Button>
                                                <Button variant="outline" size="sm" onClick={() => handleProcessJoinRequest(request.requestId, 'REJECTED')}>Decline</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-requests">
                                    <Calendar size={48} className="empty-icon" />
                                    <h3>No pending requests</h3>
                                    <p>When students ask to join your class, they will appear here.</p>
                                </div>
                            )}
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

            <EditClassModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                classData={classData}
                onUpdateSuccess={handleUpdateSuccess}
            />

            <DeleteClassModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteClass}
                isDeleting={isDeleting}
                className={classData.className}
            />

            <RemoveMemberModal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                onConfirm={handleRemoveMemberConfirm}
                isRemoving={isRemoving}
                memberName={selectedMember?.displayName}
            />

            <AddClassMaterialModal
                isOpen={isAddMaterialModalOpen}
                onClose={() => setIsAddMaterialModalOpen(false)}
                classId={classId}
                onMaterialAdded={handleMaterialAdded}
            />

            <RemoveMaterialModal
                isOpen={isRemoveMaterialModalOpen}
                onClose={() => setIsRemoveMaterialModalOpen(false)}
                onConfirm={handleRemoveMaterialConfirm}
                isRemoving={isRemovingMaterial}
                materialName={selectedMaterial?.materialName || selectedMaterial?.materialType}
            />
        </div>
    );
};

export default ClassDetailPage;
