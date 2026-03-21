import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserStatus, updateUserRole } from '../../api/user';
import {
    getPendingFlashcardSets,
    getPendingClasses,
    getModerationHistory,
    approveFlashcardSet,
    rejectFlashcardSet,
    approveClass,
    rejectClass
} from '../../api/moderation';
import { Button, Card, Loader, Badge, Modal, Tabs, EmptyState, Table, Pagination, Dropdown, Textarea } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
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
    FileCheck,
    BarChart3,
    Activity,
    CheckCircle,
    XCircle,
    MessageSquare,
    Eye,
    Shield
} from 'lucide-react';
import './AdminDashboard.css';


const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const { user: currentUser } = useAuth();

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
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('ALL');
    const [userStatusFilter, setUserStatusFilter] = useState('ALL');

    // -- SUBMISSIONS STATE --
    const [pendingSets, setPendingSets] = useState([]);
    const [isSetsLoading, setIsSetsLoading] = useState(false);
    const [selectedSet, setSelectedSet] = useState(null);
    const [isSetModalOpen, setIsSetModalOpen] = useState(false);
    const [setSearch, setSetSearch] = useState('');
    const [setVisibilityFilter, setSetVisibilityFilter] = useState('ALL');

    const [pendingClasses, setPendingClasses] = useState([]);
    const [isClassesLoading, setIsClassesLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [classSearch, setClassSearch] = useState('');

    const [moderationNotes, setModerationNotes] = useState('');
    const [isProcessingModeration, setIsProcessingModeration] = useState(false);

    // -- HISTORY STATE --
    const [modHistory, setModHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
    const [historyActionFilter, setHistoryActionFilter] = useState('ALL');

    useEffect(() => {
        // Fetch pending counts for the header stats on mount
        fetchPendingSets();
        fetchPendingClasses();
    }, []);

    // Debounce search terms
    const [debouncedUserSearch, setDebouncedUserSearch] = useState(userSearch);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedUserSearch(userSearch), 500);
        return () => clearTimeout(timer);
    }, [userSearch]);

    useEffect(() => {
        if (activeTab === 0) fetchUsers();
        else if (activeTab === 1) fetchPendingSets();
        else if (activeTab === 2) fetchPendingClasses();
        else if (activeTab === 3) fetchHistory();
        // Stats tabs 4 and 5 are placeholders for now
    }, [activeTab, userPage, debouncedUserSearch, userRoleFilter, userStatusFilter]);

    const fetchUsers = async (forceLoading = false) => {
        try {
            if (forceLoading || users.length === 0) setIsUsersLoading(true);
            const data = await getAllUsers(userPage, 10, debouncedUserSearch, userRoleFilter, userStatusFilter);
            setUsers(data.content);
            setUserTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Failed to fetch user list");
        } finally {
            setIsUsersLoading(false);
        }
    };

    const fetchPendingSets = async (forceLoading = false) => {
        try {
            if (forceLoading || pendingSets.length === 0) setIsSetsLoading(true);
            const data = await getPendingFlashcardSets();
            setPendingSets(data || []);
        } catch (error) {
            toast.error("Failed to fetch pending flashcard sets");
        } finally {
            setIsSetsLoading(false);
        }
    };

    const fetchPendingClasses = async (forceLoading = false) => {
        try {
            if (forceLoading || pendingClasses.length === 0) setIsClassesLoading(true);
            const data = await getPendingClasses();
            setPendingClasses(data || []);
        } catch (error) {
            toast.error("Failed to fetch pending classes");
        } finally {
            setIsClassesLoading(false);
        }
    };

    const fetchHistory = async (forceLoading = false) => {
        try {
            if (forceLoading || modHistory.length === 0) setIsHistoryLoading(true);
            const data = await getModerationHistory();
            setModHistory(data || []);
        } catch (error) {
            toast.error("Failed to fetch moderation history");
        } finally {
            setIsHistoryLoading(false);
        }
    };

    // -- Filtered Data --
    const filteredSets = pendingSets.filter(set => {
        const matchesSearch = !setSearch ||
            set.title.toLowerCase().includes(setSearch.toLowerCase()) ||
            set.ownerDisplayName?.toLowerCase().includes(setSearch.toLowerCase()) ||
            set.ownerUsername?.toLowerCase().includes(setSearch.toLowerCase());
        const matchesVisibility = setVisibilityFilter === 'ALL' || set.visibility === setVisibilityFilter;
        return matchesSearch && matchesVisibility;
    });

    const filteredClasses = pendingClasses.filter(cls => {
        return !classSearch ||
            cls.className.toLowerCase().includes(classSearch.toLowerCase()) ||
            cls.ownerDisplayName?.toLowerCase().includes(classSearch.toLowerCase());
    });

    const filteredHistory = modHistory.filter(entry => {
        const matchesSearch = !historySearch ||
            entry.entityName.toLowerCase().includes(historySearch.toLowerCase()) ||
            entry.moderatorDisplayName.toLowerCase().includes(historySearch.toLowerCase());
        const matchesType = historyTypeFilter === 'ALL' || entry.entityType === historyTypeFilter;
        const matchesAction = historyActionFilter === 'ALL' || entry.action === historyActionFilter;
        return matchesSearch && matchesType && matchesAction;
    });

    const handleModeration = async (entityType, entityId, action) => {
        try {
            setIsProcessingModeration(true);
            if (entityType === 'SET') {
                if (action === 'APPROVE') await approveFlashcardSet(entityId, moderationNotes);
                else await rejectFlashcardSet(entityId, moderationNotes);
                setPendingSets(prev => prev.filter(s => s.setId !== entityId));
                setIsSetModalOpen(false);
            } else if (entityType === 'CLASS') {
                if (action === 'APPROVE') await approveClass(entityId, moderationNotes);
                else await rejectClass(entityId, moderationNotes);
                setPendingClasses(prev => prev.filter(c => c.classId !== entityId));
                setIsClassModalOpen(false);
            }
            toast.success(`${entityType === 'SET' ? 'Flashcard set' : 'Class'} ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
            setModerationNotes('');
        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} ${entityType.toLowerCase()}`);
        } finally {
            setIsProcessingModeration(false);
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

    const handleUserRoleUpdate = async (userId, newRole) => {
        try {
            setIsUpdatingUser(userId);
            const updatedUser = await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.userId === userId ? updatedUser : u));
            if (selectedUser?.userId === userId) setSelectedUser(updatedUser);
            toast.success(`User role updated to ${newRole.replace('ROLE_', '')} successfully`);
        } catch (error) {
            toast.error("Failed to update user role");
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
            title: 'User Management',
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Platform Users</h2>
                            <Button variant="ghost" size="sm" onClick={() => fetchUsers(true)}>Refresh</Button>
                        </div>
                        <div className="admin-filters-row">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, username or email..."
                                    value={userSearch}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        setUserPage(0);
                                    }}
                                />
                            </div>
                            <Dropdown
                                variant="select"
                                label={userRoleFilter === 'ALL' ? 'All Roles' : userRoleFilter.replace('ROLE_', '').charAt(0) + userRoleFilter.replace('ROLE_', '').slice(1).toLowerCase()}
                                items={[
                                    { label: 'All Roles', value: 'ALL' },
                                    { label: 'Admin', value: 'ROLE_ADMIN' },
                                    { label: 'Teacher', value: 'ROLE_TEACHER' },
                                    { label: 'Student', value: 'ROLE_STUDENT' }
                                ]}
                                onItemClick={(item) => {
                                    setUserRoleFilter(item.value);
                                    setUserPage(0);
                                }}
                            />
                            <Dropdown
                                variant="select"
                                label={userStatusFilter === 'ALL' ? 'All Status' : userStatusFilter.charAt(0) + userStatusFilter.slice(1).toLowerCase()}
                                items={[
                                    { label: 'All Status', value: 'ALL' },
                                    { label: 'Active', value: 'ACTIVE' },
                                    { label: 'Suspended', value: 'SUSPENDED' }
                                ]}
                                onItemClick={(item) => {
                                    setUserStatusFilter(item.value);
                                    setUserPage(0);
                                }}
                            />
                        </div>
                        <Table
                            columns={['User', 'Role', 'Status', 'Joined', 'Actions']}
                            isLoading={isUsersLoading && users.length === 0}
                            data={users}
                            emptyIcon={Users}
                            emptyTitle="No platform users found"
                            emptyDescription="There are currently no users registered on the platform."
                            renderRow={(user) => (
                                <tr key={user.userId}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small">
                                                <img
                                                    src={user.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                    alt={user.username}
                                                />
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
                            )}
                        />
                        <Pagination
                            currentPage={userPage}
                            totalPages={userTotalPages}
                            onPageChange={setUserPage}
                        />
                    </Card>
                </div>
            )
        },
        {
            label: (
                <div className="tab-label-inner">
                    <BookOpen size={16} /> Set Submissions
                </div>
            ),
            title: 'Set Submissions',
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Flashcard Set Submissions</h2>
                            <Button variant="ghost" size="sm" onClick={() => fetchPendingSets(true)}>Refresh</Button>
                        </div>
                        <div className="admin-filters-row">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by title or author..."
                                    value={setSearch}
                                    onChange={(e) => setSetSearch(e.target.value)}
                                />
                            </div>
                            <Dropdown
                                variant="select"
                                label={setVisibilityFilter === 'ALL' ? 'All Visibility' : setVisibilityFilter.charAt(0) + setVisibilityFilter.slice(1).toLowerCase()}
                                items={[
                                    { label: 'All Visibility', value: 'ALL' },
                                    { label: 'Public', value: 'PUBLIC' },
                                    { label: 'Private', value: 'PRIVATE' }
                                ]}
                                onItemClick={(item) => setSetVisibilityFilter(item.value)}
                            />
                        </div>
                        <Table
                            columns={['Set Title', 'Owner', 'Visibility', 'Submitted At', 'Details']}
                            isLoading={isSetsLoading && pendingSets.length === 0}
                            data={filteredSets}
                            emptyIcon={BookOpen}
                            emptyTitle="No pending flashcard sets"
                            emptyDescription="There are no pending flashcard sets to review at this time."
                            renderRow={(set) => (
                                <tr key={set.setId}>
                                    <td>
                                        <span
                                            className="font-semibold cursor-pointer hover:underline text-primary"
                                            onClick={() => navigate(`/admin/submissions/flashcards/${set.setId}`, { state: { selectedSet: set } })}
                                        >
                                            {set.title}
                                        </span>
                                    </td>
                                    <td>{set.ownerDisplayName} (@{set.ownerUsername})</td>
                                    <td><Badge variant="outline">{set.visibility}</Badge></td>
                                    <td>{formatDate(set.submittedAt)}</td>
                                    <td>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setSelectedSet(set); setIsSetModalOpen(true); }}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye size={14} /> View
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        />
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
            title: 'Class Submissions',
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Class Submissions</h2>
                            <Button variant="ghost" size="sm" onClick={() => fetchPendingClasses(true)}>Refresh</Button>
                        </div>
                        <div className="admin-filters-row">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by class name or author..."
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <Table
                            columns={['Class Name', 'Owner', 'Join Code', 'Submitted At', 'Details']}
                            isLoading={isClassesLoading && pendingClasses.length === 0}
                            data={filteredClasses}
                            emptyIcon={GraduationCap}
                            emptyTitle="No pending classes"
                            emptyDescription="There are no pending classes to review at this time."
                            renderRow={(cls) => (
                                <tr key={cls.classId}>
                                    <td className="font-semibold">{cls.className}</td>
                                    <td>{cls.ownerDisplayName || 'N/A'}</td>
                                    <td><code>{cls.joinCode}</code></td>
                                    <td>{formatDate(cls.submittedAt)}</td>
                                    <td>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setSelectedClass(cls); setIsClassModalOpen(true); }}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye size={14} /> View
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        />
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
            title: 'Moderation History',
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Recent Actions</h2>
                            <Button variant="ghost" size="sm" onClick={() => fetchHistory(true)}>Refresh</Button>
                        </div>
                        <div className="admin-filters-row">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by entity or moderator..."
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                />
                            </div>
                            <Dropdown
                                variant="select"
                                label={historyTypeFilter === 'ALL' ? 'All Types' : (historyTypeFilter === 'SET' ? 'Flashcard Set' : historyTypeFilter.charAt(0) + historyTypeFilter.slice(1).toLowerCase())}
                                items={[
                                    { label: 'All Types', value: 'ALL' },
                                    { label: 'Flashcard Set', value: 'SET' },
                                    { label: 'Class', value: 'CLASS' },
                                    { label: 'User', value: 'USER' }
                                ]}
                                onItemClick={(item) => setHistoryTypeFilter(item.value)}
                            />
                            <Dropdown
                                variant="select"
                                label={historyActionFilter === 'ALL' ? 'All Actions' : historyActionFilter.replace('_', ' ').charAt(0) + historyActionFilter.replace('_', ' ').slice(1).toLowerCase()}
                                items={[
                                    { label: 'All Actions', value: 'ALL' },
                                    { label: 'Approve', value: 'APPROVE' },
                                    { label: 'Reject', value: 'REJECT' },
                                    { label: 'Suspend', value: 'SUSPENDED' },
                                    { label: 'Restore', value: 'RESTORED' },
                                    { label: 'Role Update', value: 'ROLE_UPDATE' }
                                ]}
                                onItemClick={(item) => setHistoryActionFilter(item.value)}
                            />
                        </div>
                        <Table
                            columns={['Action', 'Entity', 'Time', 'Notes', 'Details']}
                            isLoading={isHistoryLoading && modHistory.length === 0}
                            data={filteredHistory}
                            emptyIcon={HistoryIcon}
                            emptyTitle="No moderation history"
                            emptyDescription="There are no moderation history records found."
                            renderRow={(entry) => (
                                <tr key={entry.modId}>
                                    <td>
                                        <Badge variant={
                                            entry.action === 'APPROVE' || entry.action === 'RESTORED' ? 'success' :
                                                entry.action === 'REJECT' || entry.action === 'SUSPENDED' ? 'error' :
                                                    entry.action.includes('UPDATE') ? 'info' : 'primary'
                                        }>
                                            {entry.action.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{entry.entityName} </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                {entry.entityType === 'SET' ? 'Flashcard Set' :
                                                    entry.entityType === 'CLASS' ? 'Class' :
                                                        entry.entityType === 'USER' ? 'User' : entry.entityType}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{formatDate(entry.createdAt)}</td>
                                    <td className="max-w-xs truncate" title={entry.notes}>{entry.notes || '-'}</td>
                                    <td>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { setSelectedHistory(entry); setIsHistoryModalOpen(true); }}
                                        >
                                            <Info size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        />
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
            title: 'Flashcard Statistics',
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>Flashcard Set Statistics</h2>
                        </div>
                        <div className="py-20">
                            <EmptyState
                                icon={BarChart3}
                                title="Statistics Coming Soon"
                                description="Detailed analytics for flashcard sets are currently being developed."
                            />
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
            title: 'System Statistics',
            content: (
                <div className="admin-tab-content">
                    <Card className="user-list-card">
                        <div className="card-header-flex">
                            <h2>System Activity & Statistics</h2>
                        </div>
                        <div className="py-20">
                            <EmptyState
                                icon={Activity}
                                title="Health Monitor Coming Soon"
                                description="Real-time system health and usage metrics will be available here."
                            />
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
                    <h1>{adminTabs[activeTab]?.title || 'Admin Dashboard'}</h1>
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
                                <img
                                    src={selectedUser.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                                    alt={selectedUser.username}
                                />
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
                            <div className="detail-item"><label>Bio</label><span className="truncate" title={selectedUser.bio}>{selectedUser.bio || 'None'}</span></div>
                            <div className="detail-item"><label><Calendar size={14} /> Created</label><span>{formatDate(selectedUser.createdAt)}</span></div>
                            <div className="detail-item"><label><Clock size={14} /> Last Login</label><span>{formatDate(selectedUser.lastLoginAt)}</span></div>
                        </div>
                        <div className="detail-item role-management-section">
                            <label><Shield size={14} /> Role Management</label>
                            <div className="role-updater-flex">
                                <Dropdown
                                    className="w-full"
                                    variant="select"
                                    label={selectedUser.role.replace('ROLE_', '').charAt(0) + selectedUser.role.replace('ROLE_', '').slice(1).toLowerCase()}
                                    items={[
                                        { label: 'Student', value: 'ROLE_STUDENT' },
                                        { label: 'Teacher', value: 'ROLE_TEACHER' },
                                        { label: 'Administrator', value: 'ROLE_ADMIN' }
                                    ]}
                                    onItemClick={(item) => handleUserRoleUpdate(selectedUser.userId, item.value)}
                                    disabled={isUpdatingUser === selectedUser.userId || selectedUser.userId === currentUser?.userId}
                                />
                                {isUpdatingUser === selectedUser.userId && <Loader size="xs" />}
                            </div>
                        </div>
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

            {/* Flashcard Set Review Modal */}
            <Modal isOpen={isSetModalOpen} onClose={() => setIsSetModalOpen(false)} title="Review Submission" size="lg">
                {selectedSet && (
                    <div className="moderation-modal-content">
                        <div className="moderation-modal-header">
                            <div className="header-title-row">
                                <BookOpen className="header-icon" size={24} />
                                <div>
                                    <h3
                                        className="modal-main-title cursor-pointer hover:underline text-primary"
                                        onClick={() => navigate(`/admin/submissions/flashcards/${selectedSet.setId}`, { state: { selectedSet: selectedSet } })}
                                        title="View full set"
                                    >
                                        {selectedSet.title}
                                    </h3>
                                    <div className="meta-row">
                                        <Badge variant="primary">{selectedSet.visibility}</Badge>
                                        <span className="meta-text"><Clock size={14} /> Submitted {formatDate(selectedSet.submittedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="moderation-grid-single">
                            <div className="moderation-info-column">
                                <div className="info-card">
                                    <label className="section-label">Author Information</label>
                                    <div className="author-info">
                                        <div className="user-avatar-mini">
                                            <img
                                                src={selectedSet.ownerProfilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSet.ownerUsername}`}
                                                alt={selectedSet.ownerUsername}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{selectedSet.ownerDisplayName}</div>
                                            <div className="text-xs text-slate-500">@{selectedSet.ownerUsername}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-card mt-4">
                                    <label className="section-label">Description</label>
                                    <p className="description-text">{selectedSet.description || 'No description provided.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="moderation-footer">
                            <div className="notes-field">
                                <label><MessageSquare size={14} /> Moderation Feedback</label>
                                <Textarea
                                    className="w-full mt-3 mb-6"
                                    placeholder="Provide a reason for approval or rejection (optional)..."
                                    value={moderationNotes}
                                    onChange={(e) => setModerationNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="actions-flex">
                                <Button
                                    variant="success"
                                    className="flex-1 py-6"
                                    onClick={() => handleModeration('SET', selectedSet.setId, 'APPROVE')}
                                    disabled={isProcessingModeration}
                                >
                                    {isProcessingModeration ? <Loader size="xs" /> : <><CheckCircle size={20} /> Approve Set</>}
                                </Button>
                                <Button
                                    variant="error"
                                    className="flex-1 py-6"
                                    onClick={() => handleModeration('SET', selectedSet.setId, 'REJECT')}
                                    disabled={isProcessingModeration}
                                >
                                    {isProcessingModeration ? <Loader size="xs" /> : <><XCircle size={20} /> Reject Set</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Class Review Modal */}
            <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Review Submission" size="md">
                {selectedClass && (
                    <div className="moderation-modal-content">
                        <div className="moderation-modal-header">
                            <div className="header-title-row">
                                <GraduationCap className="header-icon" size={24} />
                                <div>
                                    <h3 className="modal-main-title">{selectedClass.className}</h3>
                                    <div className="meta-row">
                                        <Badge variant="primary">{selectedClass.visibility}</Badge>
                                        <span className="meta-text"><Clock size={14} /> Submitted {formatDate(selectedClass.submittedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="moderation-details-grid-single">
                                <div className="detail-item horizontal">
                                    <label><Users size={14} /> Owner</label>
                                    <span className="font-bold">{selectedClass.ownerDisplayName || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="section-label">Description</label>
                                <p className="description-text">{selectedClass.description || 'No description provided.'}</p>
                            </div>
                        </div>

                        <div className="moderation-footer">
                            <div className="notes-field">
                                <label><MessageSquare size={14} /> Moderation Feedback</label>
                                <Textarea
                                    className="w-full mt-3 mb-6"
                                    placeholder="Provide a reason for approval or rejection (optional)..."
                                    value={moderationNotes}
                                    onChange={(e) => setModerationNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="actions-flex">
                                <Button
                                    variant="success"
                                    className="flex-1 py-6"
                                    onClick={() => handleModeration('CLASS', selectedClass.classId, 'APPROVE')}
                                    disabled={isProcessingModeration}
                                >
                                    {isProcessingModeration ? <Loader size="xs" /> : <><CheckCircle size={20} /> Approve Class</>}
                                </Button>
                                <Button
                                    variant="error"
                                    className="flex-1 py-6"
                                    onClick={() => handleModeration('CLASS', selectedClass.classId, 'REJECT')}
                                    disabled={isProcessingModeration}
                                >
                                    {isProcessingModeration ? <Loader size="xs" /> : <><XCircle size={20} /> Reject Class</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Moderation History Details Modal */}
            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Action Details" size="md">
                {selectedHistory && (
                    <div className="user-detail-modal-content">
                        <div className="detail-modal-header">
                            <div className="header-icon">
                                <HistoryIcon size={28} />
                            </div>
                            <div className="header-text">
                                <h3>{selectedHistory.entityName}</h3>
                                <div className="meta-row">
                                    <Badge variant={
                                        selectedHistory.action === 'APPROVE' || selectedHistory.action === 'RESTORED' ? 'success' :
                                            selectedHistory.action === 'REJECT' || selectedHistory.action === 'SUSPENDED' ? 'error' :
                                                selectedHistory.action.includes('UPDATE') ? 'info' : 'primary'
                                    }>
                                        {selectedHistory.action.replace('_', ' ')}
                                    </Badge>
                                    <span className="meta-text">
                                        <Shield size={14} /> {selectedHistory.entityType.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-modal-grid">
                            <div className="detail-item">
                                <label>Moderator</label>
                                <span>{selectedHistory.moderatorDisplayName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Entity ID</label>
                                <span>{selectedHistory.entityId}</span>
                            </div>
                            <div className="detail-item">
                                <label><Clock size={14} /> Dated</label>
                                <span>{formatDate(selectedHistory.createdAt)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Action Type</label>
                                <Badge variant="outline">{selectedHistory.action}</Badge>
                            </div>
                        </div>

                        <div className="detail-item role-management-section">
                            <label><MessageSquare size={14} /> Moderation Notes</label>
                            <div className="description-text mt-2">
                                {selectedHistory.notes || 'No notes were provided for this action.'}
                            </div>
                        </div>

                        <div className="detail-modal-actions">
                            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)} className="w-full">Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
