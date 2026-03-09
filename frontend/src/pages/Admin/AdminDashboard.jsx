import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserStatus } from '../../api/user';
import { getPendingFlashcardSets, getPendingClasses, getModerationHistory } from '../../api/moderation';
import { Button, Card, Loader, Badge, Modal, Tabs } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import {
    Users,
    UserCheck,
    UserX,
    ShieldAlert,
    Info,
    Calendar,
    Clock,
    Search,
    BookOpen,
    GraduationCap,
    History as HistoryIcon,
    FileCheck
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    // Map paths to tab index
    const getActiveTabFromPath = (path) => {
        if (path.includes('/admin/submissions/flashcards')) return 1;
        if (path.includes('/admin/submissions/classes')) return 2;
        if (path.includes('/admin/history')) return 3;
        if (path.includes('/admin/stats/flashcards')) return 4;
        if (path.includes('/admin/stats/system')) return 5;
        return 0; // Default to users
    };

    const activeTab = getActiveTabFromPath(location.pathname);

    // -- USER MANAGEMENT STATE --
    const [users, setUsers] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isUpdatingUser, setIsUpdatingUser] = useState(null);
    const [userPage, setUserPage] = useState(0);
    const [userTotalPages, setUserTotalPages] = useState(0);

    // -- SUBMISSIONS STATE --
    const [pendingSets, setPendingSets] = useState([]);
    const [isSetsLoading, setIsSetsLoading] = useState(false);
    const [pendingClasses, setPendingClasses] = useState([]);
    const [isClassesLoading, setIsClassesLoading] = useState(false);

    // -- HISTORY STATE --
    const [modHistory, setModHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 0) fetchUsers();
        else if (activeTab === 1) fetchPendingSets();
        else if (activeTab === 2) fetchPendingClasses();
        else if (activeTab === 3) fetchHistory();
        // Stats tabs 4 and 5 are placeholders for now
    }, [activeTab, userPage]);

    const fetchUsers = async () => {
        try {
            setIsUsersLoading(true);
            const data = await getAllUsers(userPage, 10);
            setUsers(data.content);
            setUserTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Failed to fetch user list");
        } finally {
            setIsUsersLoading(false);
        }
    };

    const fetchPendingSets = async () => {
        try {
            setIsSetsLoading(true);
            const data = await getPendingFlashcardSets();
            setPendingSets(data);
        } catch (error) {
            toast.error("Failed to fetch pending flashcard sets");
        } finally {
            setIsSetsLoading(false);
        }
    };

    const fetchPendingClasses = async () => {
        try {
            setIsClassesLoading(true);
            const data = await getPendingClasses();
            setPendingClasses(data);
        } catch (error) {
            toast.error("Failed to fetch pending classes");
        } finally {
            setIsClassesLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setIsHistoryLoading(true);
            const data = await getModerationHistory();
            setModHistory(data);
        } catch (error) {
            toast.error("Failed to fetch moderation history");
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleUserStatusUpdate = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        try {
            setIsUpdatingUser(userId);
            const updatedUser = await updateUserStatus(userId, newStatus);
            setUsers(prev => prev.map(u => u.userId === userId ? updatedUser : u));
            if (selectedUser?.userId === userId) setSelectedUser(updatedUser);
            toast.success(`User ${updatedUser.status === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`);
        } catch (error) {
            toast.error("Failed to update user status");
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleTabChange = (index) => {
        const paths = [
            '/admin/users',
            '/admin/submissions/flashcards',
            '/admin/submissions/classes',
            '/admin/history',
            '/admin/stats/flashcards',
            '/admin/stats/system'
        ];
        navigate(paths[index]);
    };

    const adminTabs = [
        {
            label: (
                <div className="tab-label-inner">
                    <Users size={16} /> User Management
                </div>
            ),
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Platform Users</h2>
                            <Button variant="ghost" size="sm" onClick={fetchUsers}>Refresh</Button>
                        </div>
                        {isUsersLoading ? <Loader size="lg" className="m-auto py-10" /> : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.userId}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar-small">
                                                            {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt="" /> : user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="user-info-cell">
                                                            <span className="user-display-name">{user.displayName || user.username}</span>
                                                            <span className="user-email">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge variant={user.role === 'ROLE_ADMIN' ? 'error' : user.role === 'ROLE_TEACHER' ? 'success' : 'primary'}>
                                                        {user.role.replace('ROLE_', '')}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'error' : 'warning'}>
                                                        {user.status}
                                                    </Badge>
                                                </td>
                                                <td>{formatDate(user.createdAt)}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }}><Info size={18} /></Button>
                                                        {user.role !== 'ROLE_ADMIN' && (
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className={user.status === 'SUSPENDED' ? 'action-activate' : 'action-suspend'}
                                                                onClick={() => handleUserStatusUpdate(user.userId, user.status)}
                                                                disabled={isUpdatingUser === user.userId}
                                                            >
                                                                {isUpdatingUser === user.userId ? <Loader size="xs" /> : (user.status === 'SUSPENDED' ? <UserCheck size={18} /> : <UserX size={18} />)}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {userTotalPages > 1 && (
                            <div className="pagination">
                                <Button disabled={userPage === 0} onClick={() => setUserPage(userPage - 1)} variant="outline" size="sm">Previous</Button>
                                <span className="page-info">Page {userPage + 1} of {userTotalPages}</span>
                                <Button disabled={userPage === userTotalPages - 1} onClick={() => setUserPage(userPage + 1)} variant="outline" size="sm">Next</Button>
                            </div>
                        )}
                    </Card>
                </div>
            )
        },
        {
            label: (
                <div className="tab-label-inner">
                    <BookOpen size={16} /> Flashcard Submissions
                </div>
            ),
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Flashcard Set Submissions</h2>
                            <Button variant="ghost" size="sm" onClick={fetchPendingSets}>Refresh</Button>
                        </div>
                        {isSetsLoading ? <Loader size="lg" className="m-auto py-10" /> : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Set Title</th>
                                            <th>Owner</th>
                                            <th>Visibility</th>
                                            <th>Submitted At</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingSets.length > 0 ? pendingSets.map(set => (
                                            <tr key={set.setId}>
                                                <td className="font-semibold">{set.title}</td>
                                                <td>{set.ownerDisplayName} (@{set.ownerUsername})</td>
                                                <td><Badge variant="outline">{set.visibility}</Badge></td>
                                                <td>{formatDate(set.submittedAt)}</td>
                                                <td><Button variant="ghost" size="sm">View Set</Button></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-10 text-slate-400">No pending flashcard sets found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )
        },
        {
            label: (
                <div className="tab-label-inner">
                    <GraduationCap size={16} /> Class Submissions
                </div>
            ),
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Class Submissions</h2>
                            <Button variant="ghost" size="sm" onClick={fetchPendingClasses}>Refresh</Button>
                        </div>
                        {isClassesLoading ? <Loader size="lg" className="m-auto py-10" /> : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Class Name</th>
                                            <th>Owner</th>
                                            <th>Join Code</th>
                                            <th>Submitted At</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingClasses.length > 0 ? pendingClasses.map(cls => (
                                            <tr key={cls.classId}>
                                                <td className="font-semibold">{cls.className}</td>
                                                <td>{cls.ownerDisplayName || 'N/A'}</td>
                                                <td><code>{cls.joinCode}</code></td>
                                                <td>{formatDate(cls.submittedAt)}</td>
                                                <td><Button variant="ghost" size="sm">View Class</Button></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-10 text-slate-400">No pending classes found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )
        },
        {
            label: (
                <div className="tab-label-inner">
                    <HistoryIcon size={16} /> Moderation History
                </div>
            ),
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Recent Actions</h2>
                            <Button variant="ghost" size="sm" onClick={fetchHistory}>Refresh</Button>
                        </div>
                        {isHistoryLoading ? <Loader size="lg" className="m-auto py-10" /> : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Moderator</th>
                                            <th>Action</th>
                                            <th>Entity</th>
                                            <th>Time</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modHistory.length > 0 ? modHistory.map(entry => (
                                            <tr key={entry.modId}>
                                                <td>{entry.moderatorDisplayName}</td>
                                                <td><Badge variant={entry.action === 'APPROVE' ? 'success' : entry.action === 'REJECT' ? 'error' : 'primary'}>{entry.action}</Badge></td>
                                                <td>{entry.entityType} ({entry.entityId})</td>
                                                <td>{formatDate(entry.createdAt)}</td>
                                                <td className="max-w-xs truncate" title={entry.notes}>{entry.notes || '-'}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-10 text-slate-400">No moderation history records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )
        },
        {
            label: (
                <div className="tab-label-inner">
                    <BarChart3 size={16} /> Flashcard Statistics
                </div>
            ),
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Flashcard Set Statistics</h2>
                        </div>
                        <div className="p-20 text-center">
                            <BarChart3 size={48} className="m-auto mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold mb-2">Statistics Coming Soon</h3>
                            <p className="text-slate-500">Detailed analytics for flashcard sets are currently being developed.</p>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            label: (
                <div className="tab-label-inner">
                    <Activity size={16} /> System Statistics
                </div>
            ),
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>System Activity & Statistics</h2>
                        </div>
                        <div className="p-20 text-center">
                            <Activity size={48} className="m-auto mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold mb-2">Health Monitor Coming Soon</h3>
                            <p className="text-slate-500">Real-time system health and usage metrics will be available here.</p>
                        </div>
                    </Card>
                </div>
            )
        }
    ];

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="admin-header-main">
                    <h1>Admin Dashboard</h1>
                    <p className="admin-subtitle">Monitoring and moderation tools</p>
                </div>
                <div className="admin-stats">
                    <Card className="stat-card">
                        <FileCheck className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-label">Pending Reviews</span>
                            <span className="stat-value">{pendingSets.length + pendingClasses.length} Items</span>
                        </div>
                    </Card>
                </div>
            </header>

            <div className="admin-tabs-section">
                {adminTabs[activeTab]?.content}
            </div>

            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="User Details" size="md">
                {selectedUser && (
                    <div className="user-detail-modal-content">
                        <div className="detail-modal-header">
                            <div className="user-avatar-large">
                                {selectedUser.profilePictureUrl ? <img src={selectedUser.profilePictureUrl} alt="" /> : selectedUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="header-text">
                                <h3>{selectedUser.displayName || selectedUser.username}</h3>
                                <p>@{selectedUser.username}</p>
                                <div className="detail-status-badge">
                                    <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'error'}>{selectedUser.status}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="detail-modal-grid">
                            <div className="detail-item"><label>Email</label><span>{selectedUser.email}</span></div>
                            <div className="detail-item"><label>Role</label><span>{selectedUser.role.replace('ROLE_', '')}</span></div>
                            <div className="detail-item"><label><Calendar size={14} /> Created</label><span>{formatDate(selectedUser.createdAt)}</span></div>
                            <div className="detail-item"><label><Clock size={14} /> Last Login</label><span>{formatDate(selectedUser.lastLoginAt)}</span></div>
                        </div>
                        <div className="detail-item bio-section"><label>Bio</label><p className="bio-text">{selectedUser.bio || 'No bio provided'}</p></div>
                        <div className="detail-modal-actions">
                            {selectedUser.role !== 'ROLE_ADMIN' && (
                                <Button
                                    variant={selectedUser.status === 'SUSPENDED' ? 'primary' : 'error'}
                                    onClick={() => handleUserStatusUpdate(selectedUser.userId, selectedUser.status)}
                                    disabled={isUpdatingUser === selectedUser.userId}
                                    className="w-full"
                                >
                                    {isUpdatingUser === selectedUser.userId ? <Loader size="xs" /> : (selectedUser.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account')}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setIsUserModalOpen(false)} className="w-full">Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
