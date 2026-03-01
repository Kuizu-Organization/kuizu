import React, { useState, useEffect } from 'react';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Sidebar from './Sidebar/Sidebar';
import { Loader } from '../ui';

const MainLayout = ({ children, isLoading = false }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true' ? true : false;
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebar-collapsed', newState.toString());
            return newState;
        });
    };

    return (
        <div className={`layout-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Navbar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
            <div className="layout-body" style={{ display: 'flex' }}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
                <div className="content-wrapper" style={{
                    flex: 1,
                    marginLeft: isSidebarCollapsed ? '72px' : '240px',
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '100%',
                    minHeight: 'calc(100vh - 5rem)',
                    backgroundColor: 'var(--white)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <main className="main-content" style={{
                        flex: 1,
                        paddingBottom: '80px',
                        display: isLoading ? 'flex' : 'block',
                        alignItems: isLoading ? 'center' : 'initial',
                        justifyContent: isLoading ? 'center' : 'initial'
                    }}>
                        {isLoading ? (
                            <Loader fullPage={false} size="lg" />
                        ) : (
                            children
                        )}
                    </main>
                    {!isLoading && <Footer />}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
