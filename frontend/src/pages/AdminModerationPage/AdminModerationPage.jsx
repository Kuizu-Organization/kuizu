import { useState, useEffect } from 'react';
import {
    ShieldAlert,
    CheckCircle,
    XCircle,
    History,
    UserCog,
    Clock,
    AlertTriangle
} from 'lucide-react';
import {
    processModeration,
    getModerationHistory,
    getPendingSets,
    getPendingClasses,
    getAllUsers
} from '@/api/moderation';
import { Button, Card, Loader, Modal } from '@/components/ui';
import MainLayout from '@/components/layout';
import './AdminModerationPage.css';
import { useToast } from '@/context/ToastContext';

const AdminModerationPage = () => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('sets');
    const [loading, setLoading] = useState(true);
    const [pendingSets, setPendingSets] = useState([]);
    const [pendingClasses, setPendingClasses] = useState([]);
    const [users, setUsers] = useState([]);
    const [history, setHistory] = useState([]);

    // Modal states
    const [isModModalOpen, setIsModModalOpen] = useState(false);
    const [modData, setModData] = useState({
        entityType: '',
        entityId: '',
        action: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'sets') setPendingSets(await getPendingSets());
            if (activeTab === 'classes') setPendingClasses(await getPendingClasses());
            if (activeTab === 'users') setUsers(await getAllUsers());
            if (activeTab === 'history') setHistory(await getModerationHistory());
        } catch (err) {
            toast.error('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModModal = (type, id, action) => {
        setModData({ entityType: type, entityId: id, action: action, notes: '' });
        setIsModModalOpen(true);
    };

    const handleModSubmit = async () => {
        try {
            await processModeration(modData);
            toast.success(`Action ${modData.action} successful!`);
            setIsModModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Action failed.');
        }
    };

    const renderSets = () => (
        <div className="mod-grid">
            {pendingSets.length === 0 ? <p className="empty-msg">No pending flashcard sets.</p> :
                pendingSets.map(set => (
                    <Card key={set.setId} className="mod-item-card">
                        <div className="card-header">
                            <h3>{set.title}</h3>
                            <span className="badge pending">Pending Set</span>
                        </div>
                        <p className="description">{set.description || 'No description'}</p>
                        <div className="meta">By: {set.ownerDisplayName}</div>
                        <div className="actions">
                            <Button variant="outline" size="sm" onClick={() => handleOpenModModal('SET', set.setId, 'APPROVE')} className="approve-btn">
                                <CheckCircle size={16} /> Approve
                            </Button>
                            <Button variant="outline" className="reject-btn" size="sm" onClick={() => handleOpenModModal('SET', set.setId, 'REJECT')}>
                                <XCircle size={16} /> Reject
                            </Button>
                        </div>
                    </Card>
                ))}
        </div>
    );

    const renderClasses = () => (
        <div className="mod-grid">
            {pendingClasses.length === 0 ? <p className="empty-msg">No pending classes.</p> :
                pendingClasses.map(cls => (
                    <Card key={cls.classId} className="mod-item-card">
                        <div className="card-header">
                            <h3>{cls.className}</h3>
                            <span className="badge pending">Pending Class</span>
                        </div>
                        <p className="description">{cls.description || 'No description'}</p>
                        <div className="meta">By: {cls.ownerDisplayName}</div>
                        <div className="actions">
                            <Button variant="outline" size="sm" onClick={() => handleOpenModModal('CLASS', cls.classId, 'APPROVE')} className="approve-btn">
                                <CheckCircle size={16} /> Approve
                            </Button>
                            <Button variant="outline" className="reject-btn" size="sm" onClick={() => handleOpenModModal('CLASS', cls.classId, 'REJECT')}>
                                <XCircle size={16} /> Reject
                            </Button>
                        </div>
                    </Card>
                ))}
        </div>
    );

    const renderUsers = () => (
        <div className="mod-table-container">
            <table className="mod-table">
                <thead>
                    <tr>
                        <th>Display Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userId}>
                            <td>{user.displayName}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                            <td>
                                {user.status !== 'SUSPENDED' ? (
                                    <Button variant="ghost" size="sm" className="suspend-btn" onClick={() => handleOpenModModal('USER', user.userId, 'SUSPEND')}>
                                        <AlertTriangle size={16} /> Suspend
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm" className="activate-btn" onClick={() => handleOpenModModal('USER', user.userId, 'ACTIVATE')}>
                                        <CheckCircle size={16} /> Reactivate
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderHistory = () => (
        <div className="mod-table-container">
            <table className="mod-table">
                <thead>
                    <tr>
                        <th>Moderator</th>
                        <th>Entity</th>
                        <th>Action</th>
                        <th>Notes</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.modId}>
                            <td>{item.moderatorDisplayName}</td>
                            <td>{item.entityType} ({item.entityId})</td>
                            <td><span className={`action-badge ${item.action.toLowerCase()}`}>{item.action}</span></td>
                            <td className="notes-cell">{item.notes}</td>
                            <td>{new Date(item.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <MainLayout>
            <div className="moderation-container">
                <header className="mod-header">
                    <div className="title-section">
                        <ShieldAlert className="title-icon" size={32} />
                        <div>
                            <h1>Moderation Dashboard</h1>
                            <p>Global content review and user management</p>
                        </div>
                    </div>
                </header>

                <div className="mod-tabs">
                    <button className={activeTab === 'sets' ? 'active' : ''} onClick={() => setActiveTab('sets')}>
                        <Clock size={18} /> Flashcard Sets
                    </button>
                    <button className={activeTab === 'classes' ? 'active' : ''} onClick={() => setActiveTab('classes')}>
                        <Clock size={18} /> Classes
                    </button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <UserCog size={18} /> Users
                    </button>
                    <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                        <History size={18} /> History
                    </button>
                </div>

                <div className="mod-content">
                    {loading ? <Loader fullPage={false} /> : (
                        <>
                            {activeTab === 'sets' && renderSets()}
                            {activeTab === 'classes' && renderClasses()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'history' && renderHistory()}
                        </>
                    )}
                </div>

                <Modal
                    isOpen={isModModalOpen}
                    onClose={() => setIsModModalOpen(false)}
                    title={`Confirm ${modData.action}`}
                >
                    <div className="mod-modal-form">
                        <p>Are you sure you want to <strong>{modData.action}</strong> this {modData.entityType.toLowerCase()}?</p>
                        <div className="form-group">
                            <label>Moderation Notes</label>
                            <textarea
                                value={modData.notes}
                                onChange={(e) => setModData({ ...modData, notes: e.target.value })}
                                placeholder="Provide a reason for this action..."
                                rows={4}
                            />
                        </div>
                        <div className="modal-actions">
                            <Button variant="ghost" onClick={() => setIsModModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleModSubmit}>Confirm Action</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
};

export default AdminModerationPage;
