import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFolderDetail, removeSetFromFolder, deleteFolder } from '../../api/folder';
import { Loader, Modal, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AddSetToFolderModal from '../../components/Folder/AddSetToFolderModal';
import EditFolderModal from '../../components/Folder/EditFolderModal';
import { ArrowLeft, BookOpen, FolderOpen, User, Eye, Calendar, Layers, Hash, ChevronDown, ChevronUp, Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import './FolderDetailPage.css';

const FolderDetailPage = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [folder, setFolder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSets, setExpandedSets] = useState({});
    const [isAddSetOpen, setIsAddSetOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingSetId, setRemovingSetId] = useState(null);

    const fetchFolder = async () => {
        try {
            setIsLoading(true);
            const data = await getFolderDetail(folderId);
            setFolder(data);
            if (data?.sets) {
                const expanded = {};
                data.sets.forEach(s => { expanded[s.setId] = true; });
                setExpandedSets(expanded);
            }
        } catch (error) {
            console.error("Failed to fetch folder detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFolder();
    }, [folderId]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTotalTerms = () => {
        if (!folder?.sets) return 0;
        return folder.sets.reduce((sum, set) => sum + (set.termCount || 0), 0);
    };

    const toggleSetExpand = (setId) => {
        setExpandedSets(prev => ({
            ...prev,
            [setId]: !prev[setId]
        }));
    };

    const expandAll = () => {
        if (!folder?.sets) return;
        const expanded = {};
        folder.sets.forEach(s => { expanded[s.setId] = true; });
        setExpandedSets(expanded);
    };

    const collapseAll = () => {
        setExpandedSets({});
    };

    const handleRemoveSet = async (e, setId) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc muốn xóa học phần này khỏi thư mục?')) return;

        try {
            setRemovingSetId(setId);
            await removeSetFromFolder(folderId, setId);
            toast.success('Đã xóa học phần khỏi thư mục');
            fetchFolder();
        } catch (error) {
            toast.error('Không thể xóa học phần');
        } finally {
            setRemovingSetId(null);
        }
    };

    const handleFolderUpdated = (updatedFolder) => {
        setFolder(updatedFolder);
        setIsEditOpen(false);
    };

    const confirmDeleteFolder = async () => {
        try {
            setIsDeleting(true);
            await deleteFolder(folderId);
            toast.success('Xóa thư mục thành công');
            navigate('/folders'); // Navigate back to folders list
        } catch (error) {
            console.error('Failed to delete folder:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa thư mục');
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    const deleteFooter = (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Hủy</Button>
            <Button variant="danger" onClick={confirmDeleteFolder} isLoading={isDeleting}>Xóa thư mục</Button>
        </div>
    );

    const isOwner = user && folder && folder.ownerUsername === user.username;
    const allExpanded = folder?.sets?.every(s => expandedSets[s.setId]);

    if (isLoading) {
        return <Loader fullPage={true} />;
    }

    if (!folder) {
        return (
            <div className="fd-container">
                <p>Không tìm thấy thư mục.</p>
            </div>
        );
    }

    return (
        <div className="fd-container">
            <button className="fd-back" onClick={() => navigate('/folders')}>
                <ArrowLeft size={18} />
                <span>Quay lại thư mục</span>
            </button>

            {/* ====== FOLDER INFO SECTION ====== */}
            <div className="fd-info-card">
                <div className="fd-info-header">
                    <div className="fd-info-header-main">
                        <div className="fd-info-icon">
                            <FolderOpen size={28} />
                        </div>
                        <div className="fd-info-header-text">
                            <h1 className="fd-name">{folder.name}</h1>
                            {folder.description && (
                                <p className="fd-description">{folder.description}</p>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <div className="fd-info-header-actions">
                            <button className="fd-action-btn edit-btn" onClick={() => setIsEditOpen(true)}>
                                <Pencil size={16} />
                                <span>Chỉnh sửa</span>
                            </button>
                            <button className="fd-action-btn delete-btn" onClick={() => setIsDeleteOpen(true)}>
                                <Trash2 size={16} />
                                <span>Xóa</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="fd-info-grid">
                    <div className="fd-info-item">
                        <User size={16} />
                        <div>
                            <span className="fd-info-label">Người tạo</span>
                            <span className="fd-info-value">{folder.ownerDisplayName}</span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Layers size={16} />
                        <div>
                            <span className="fd-info-label">Số học phần</span>
                            <span className="fd-info-value">{folder.sets?.length || 0} học phần</span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Hash size={16} />
                        <div>
                            <span className="fd-info-label">Tổng thuật ngữ</span>
                            <span className="fd-info-value">{getTotalTerms()} thuật ngữ</span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Eye size={16} />
                        <div>
                            <span className="fd-info-label">Hiển thị</span>
                            <span className="fd-info-value">
                                {folder.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                            </span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Calendar size={16} />
                        <div>
                            <span className="fd-info-label">Ngày tạo</span>
                            <span className="fd-info-value">{formatDate(folder.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ====== TERMS LIST SECTION ====== */}
            <div className="fd-terms-section">
                <div className="fd-terms-header">
                    <h2>Danh sách thuật ngữ trong thư mục</h2>
                    <div className="fd-terms-header-actions">
                        {isOwner && (
                            <button
                                className="fd-add-set-btn"
                                onClick={() => setIsAddSetOpen(true)}
                            >
                                <Plus size={16} />
                                Thêm học phần
                            </button>
                        )}
                        {folder.sets && folder.sets.length > 0 && (
                            <button
                                className="fd-toggle-all-btn"
                                onClick={allExpanded ? collapseAll : expandAll}
                            >
                                {allExpanded ? (
                                    <><ChevronUp size={14} /> Thu gọn</>
                                ) : (
                                    <><ChevronDown size={14} /> Mở rộng</>
                                )}
                            </button>
                        )}
                        <span className="fd-terms-badge">{getTotalTerms()} thuật ngữ</span>
                    </div>
                </div>

                {folder.sets && folder.sets.length > 0 ? (
                    <div className="fd-terms-groups">
                        {folder.sets.map(set => {
                            const isExpanded = expandedSets[set.setId];
                            return (
                                <div key={set.setId} className={`fd-set-group ${isExpanded ? 'expanded' : ''}`}>
                                    <div
                                        className="fd-set-title-bar"
                                        onClick={() => toggleSetExpand(set.setId)}
                                    >
                                        <div className="fd-set-title-left">
                                            <BookOpen size={18} />
                                            <h3>{set.title}</h3>
                                            <span className="fd-set-count-chip">{set.termCount} thuật ngữ</span>
                                        </div>
                                        <div className="fd-set-title-right">
                                            <div className="fd-set-owner-chip">
                                                <div className="fd-set-avatar">
                                                    {getInitials(set.ownerDisplayName)}
                                                </div>
                                                <span>{set.ownerDisplayName}</span>
                                            </div>
                                            {isOwner && (
                                                <button
                                                    className="fd-remove-set-btn"
                                                    onClick={(e) => handleRemoveSet(e, set.setId)}
                                                    disabled={removingSetId === set.setId}
                                                    title="Xóa khỏi thư mục"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <div className="fd-set-toggle">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="fd-set-content">
                                            {set.description && (
                                                <p className="fd-set-desc">{set.description}</p>
                                            )}

                                            {set.flashcards && set.flashcards.length > 0 && (
                                                <div className="fd-terms-table">
                                                    <div className="fd-terms-table-header">
                                                        <div className="fd-th-num">#</div>
                                                        <div className="fd-th-term">Thuật ngữ</div>
                                                        <div className="fd-th-def">Định nghĩa</div>
                                                    </div>
                                                    {set.flashcards.map((card, index) => (
                                                        <div key={card.cardId} className="fd-terms-row">
                                                            <div className="fd-td-num">{index + 1}</div>
                                                            <div className="fd-td-term">{card.term}</div>
                                                            <div className="fd-td-def">{card.definition}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="fd-empty">
                        <BookOpen size={32} color="var(--text-light)" />
                        <p>Thư mục này chưa có học phần nào</p>
                        {isOwner && (
                            <button
                                className="fd-add-set-btn primary"
                                onClick={() => setIsAddSetOpen(true)}
                            >
                                <Plus size={16} />
                                Thêm học phần đầu tiên
                            </button>
                        )}
                    </div>
                )}
            </div>

            <AddSetToFolderModal
                isOpen={isAddSetOpen}
                onClose={() => setIsAddSetOpen(false)}
                folderId={folderId}
                onSetAdded={fetchFolder}
            />

            <EditFolderModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                folder={folder}
                onUpdateSuccess={handleFolderUpdated}
            />

            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Xóa thư mục"
                size="sm"
                footer={deleteFooter}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>
                        Xóa thư mục này?
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                        Hành động này sẽ xóa thư mục <strong>"{folder.name}"</strong> vĩnh viễn. 
                        Các học phần bên trong thư mục này <strong>SẼ KHÔNG</strong> bị xóa. Bạn có chắc chắn muốn tiến hành?
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default FolderDetailPage;
