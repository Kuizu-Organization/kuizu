import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, ShieldCheck, ShieldX, UserCheck, UserX, ExternalLink, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Loader, Modal, Button } from '../../ui';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/api/notifications';
import './NotificationBell.css';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch unread count');
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        setSelectedNotification(notification);
        setIsOpen(false);
        if (!notification.read) {
            try {
                await markAsRead(notification.notificationId);
                setNotifications(notifications.map(n => n.notificationId === notification.notificationId ? { ...n, read: true } : n));
                fetchUnreadCount();
            } catch (error) {
                console.error('Failed to mark as read');
            }
        }
    };

    const handleGoToRelated = (notification) => {
        setSelectedNotification(null);
        const lowerTitle = notification.title.toLowerCase();

        if (notification.type === 'MODERATION') {
            // If it's a pending notification (for Admin), go to moderation dashboard
            if (lowerTitle.includes('pending') || lowerTitle.includes('new')) {
                navigate('/admin/moderation');
                return;
            }

            // If it's a result notification (for User), go to the specific content
            if (!notification.relatedId) return;
            if (lowerTitle.includes('set')) {
                navigate(`/flashcard-sets/${notification.relatedId}`);
            } else if (lowerTitle.includes('class')) {
                navigate(`/classes/${notification.relatedId}`);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    const getIcon = (type, title) => {
        const lowerTitle = title.toLowerCase();
        if (type === 'MODERATION') {
            if (lowerTitle.includes('approved')) return <ShieldCheck className="icon-approved" size={16} />;
            if (lowerTitle.includes('pending') || lowerTitle.includes('new')) return <ShieldAlert className="icon-pending" size={16} />;
            return <ShieldX className="icon-rejected" size={16} />;
        }
        if (type === 'SYSTEM') {
            if (lowerTitle.includes('reactivated')) return <UserCheck className="icon-approved" size={16} />;
            return <UserX className="icon-rejected" size={16} />;
        }
        return <Bell size={16} />;
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="bell-btn" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                                <Check size={14} /> Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="dropdown-content">
                        {loading ? (
                            <div className="dropdown-loader"><Loader size="sm" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <Bell size={40} className="empty-icon" />
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.notificationId}
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getIcon(notification.type, notification.title)}
                                    </div>
                                    <div className="notification-info">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.content}</div>
                                        <div className="notification-time">
                                            <Clock size={12} /> {new Date(notification.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    {!notification.read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <Modal
                isOpen={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                title={selectedNotification?.title || 'Notification Details'}
            >
                {selectedNotification && (
                    <div className="notification-detail-modal">
                        <div className="detail-header">
                            <div className="detail-icon">
                                {getIcon(selectedNotification.type, selectedNotification.title)}
                            </div>
                            <div className="detail-meta">
                                <span className="detail-type">{selectedNotification.type}</span>
                                <span className="detail-date">
                                    <Clock size={14} />
                                    {new Date(selectedNotification.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="detail-content">
                            <p>{selectedNotification.content}</p>
                        </div>

                        <div className="detail-footer">
                            {selectedNotification.relatedId && (
                                <Button
                                    variant="primary"
                                    onClick={() => handleGoToRelated(selectedNotification)}
                                    className="view-content-btn"
                                >
                                    {(selectedNotification.title.toLowerCase().includes('pending') ||
                                        selectedNotification.title.toLowerCase().includes('new')) ? (
                                        <>
                                            <ShieldAlert size={18} /> Go to Moderation
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink size={18} /> View Related Content
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NotificationBell;
