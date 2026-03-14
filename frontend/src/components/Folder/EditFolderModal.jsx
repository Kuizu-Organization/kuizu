import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { updateFolder } from '../../api/folder';
import { useToast } from '../../context/ToastContext';
import './CreateFolderModal.css';

const EditFolderModal = ({ isOpen, onClose, folder, onUpdateSuccess }) => {
    const toast = useToast();
    const [folderName, setFolderName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && folder) {
            setFolderName(folder.name || '');
            setDescription(folder.description || '');
            setVisibility(folder.visibility || 'PUBLIC');
        }
    }, [isOpen, folder]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (isSubmitting) return;

        if (!folderName.trim()) {
            toast.error('Tên thư mục không được để trống');
            return;
        }

        setIsSubmitting(true);
        try {
            const folderData = {
                name: folderName,
                description,
                visibility
            };

            const updatedFolder = await updateFolder(folder.folderId, folderData);
            toast.success('Cập nhật thư mục thành công!');

            if (onUpdateSuccess) {
                onUpdateSuccess(updatedFolder);
            }
            onClose();

        } catch (error) {
            console.error('Failed to update folder:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật thư mục');
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="create-folder-actions">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !folderName.trim()}
                isLoading={isSubmitting}
            >
                Lưu thay đổi
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chỉnh sửa thư mục"
            size="md"
            footer={footer}
        >
            <div className="create-folder-content">
                <form onSubmit={handleSubmit}>
                    <div className="form-group slide-in">
                        <label>Tên thư mục *</label>
                        <Input
                            placeholder="Ví dụ: Tài liệu Học kỳ 1"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group slide-in" style={{ animationDelay: '0.1s' }}>
                        <label>Mô tả (Không bắt buộc)</label>
                        <textarea
                            className="create-folder-textarea"
                            placeholder="Mô tả nội dung thư mục..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        ></textarea>
                    </div>

                    <div className="form-group slide-in" style={{ animationDelay: '0.2s' }}>
                        <label>Hiển thị</label>
                        <div className="visibility-options">
                            <div
                                className={`visibility-option ${visibility === 'PUBLIC' ? 'active' : ''}`}
                                onClick={() => setVisibility('PUBLIC')}
                            >
                                <div className="visibility-radio">
                                    <div className={`radio-dot ${visibility === 'PUBLIC' ? 'checked' : ''}`}></div>
                                </div>
                                <div className="visibility-text">
                                    <span className="visibility-label">🌐 Công khai</span>
                                    <span className="visibility-desc">Tất cả người dùng đều có thể xem thư mục này</span>
                                </div>
                            </div>
                            <div
                                className={`visibility-option ${visibility === 'PRIVATE' ? 'active' : ''}`}
                                onClick={() => setVisibility('PRIVATE')}
                            >
                                <div className="visibility-radio">
                                    <div className={`radio-dot ${visibility === 'PRIVATE' ? 'checked' : ''}`}></div>
                                </div>
                                <div className="visibility-text">
                                    <span className="visibility-label">🔒 Riêng tư</span>
                                    <span className="visibility-desc">Chỉ bạn mới có thể xem thư mục này</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditFolderModal;
