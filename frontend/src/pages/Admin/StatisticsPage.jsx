import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Table, Pagination, EmptyState, Loader } from '@/components/ui';
import { getUserStatistics, getFlashcardSetStatistics, getClassStatistics, getDashboardSummary, getFlashcardSummary, getClassSummary } from '@/api/statistics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Brush } from 'recharts';
import { useToast } from '@/context/ToastContext';
import { TrendingUp, BookOpen, Users, GraduationCap, Mail, UserPlus, BarChart } from 'lucide-react';
import './AdminDashboard.css';
import './StatisticsPage.css';

const StatisticsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    // Map paths to active view
    const getActiveView = () => {
        if (location.pathname.includes('/flashcards')) return 'flashcards';
        if (location.pathname.includes('/classes')) return 'classes';
        return 'users';
    };

    const activeView = getActiveView();

    // -- DASHBOARD SUMMARY STATE --
    const [summary, setSummary] = useState(null);
    const [chartDays, setChartDays] = useState(7);

    // -- STATS STATE --
    const [userStats, setUserStats] = useState([]);
    const [isUserStatsLoading, setIsUserStatsLoading] = useState(true);
    const [userStatsPage, setUserStatsPage] = useState(0);
    const [userStatsTotalPages, setUserStatsTotalPages] = useState(0);

    const [flashcardStats, setFlashcardStats] = useState([]);
    const [isFlashcardStatsLoading, setIsFlashcardStatsLoading] = useState(true);
    const [flashcardStatsPage, setFlashcardStatsPage] = useState(0);
    const [flashcardStatsTotalPages, setFlashcardStatsTotalPages] = useState(0);

    const [classStats, setClassStats] = useState([]);
    const [isClassStatsLoading, setIsClassStatsLoading] = useState(true);
    const [classStatsPage, setClassStatsPage] = useState(0);
    const [classStatsTotalPages, setClassStatsTotalPages] = useState(0);

    useEffect(() => {
        fetchSummary(chartDays, activeView);
    }, [chartDays, activeView]);

    const fetchSummary = async (days, view) => {
        try {
            let data;
            if (view === 'flashcards') {
                data = await getFlashcardSummary(days);
            } else if (view === 'classes') {
                data = await getClassSummary(days);
            } else {
                data = await getDashboardSummary(days);
            }
            setSummary(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDaysChange = (e) => {
        setChartDays(Number(e.target.value));
    };

    useEffect(() => {
        if (activeView === 'users') fetchUserStats();
        else if (activeView === 'flashcards') fetchFlashcardStats();
        else if (activeView === 'classes') fetchClassStats();
    }, [activeView, userStatsPage, flashcardStatsPage, classStatsPage]);

    const fetchUserStats = async () => {
        try {
            setIsUserStatsLoading(true);
            const data = await getUserStatistics(userStatsPage, 10);
            setUserStats(data.content);
            setUserStatsTotalPages(data.totalPages);
        } catch (error) {
            console.error("User stats error:", error);
            toast.error("Failed to fetch user statistics");
        } finally {
            setIsUserStatsLoading(false);
        }
    };

    const fetchFlashcardStats = async () => {
        try {
            setIsFlashcardStatsLoading(true);
            const data = await getFlashcardSetStatistics(flashcardStatsPage, 10);
            setFlashcardStats(data.content);
            setFlashcardStatsTotalPages(data.totalPages);
        } catch (error) {
            console.error("Flashcard stats error:", error);
            toast.error("Failed to fetch flashcard statistics");
        } finally {
            setIsFlashcardStatsLoading(false);
        }
    };

    const fetchClassStats = async () => {
        try {
            setIsClassStatsLoading(true);
            const data = await getClassStatistics(classStatsPage, 10);
            setClassStats(data.content);
            setClassStatsTotalPages(data.totalPages);
        } catch (error) {
            console.error("Class stats error:", error);
            toast.error("Failed to fetch class statistics");
        } finally {
            setIsClassStatsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderContent = () => {
        if (activeView === 'users') {
            return (
                <div className="admin-tab-content w-full">
                    <Card className="user-list-card w-full mb-6">
                        <div className="card-header-flex">
                            <h2>User Activity & Statistics</h2>
                            <Button variant="ghost" size="sm" onClick={fetchUserStats}>Refresh</Button>
                        </div>
                        <Table
                            columns={['User', 'Sets Created', 'Cards Created', 'Quizzes Taken', 'Avg Score', 'Last Active']}
                            isLoading={isUserStatsLoading}
                            data={userStats}
                            emptyIcon={Users}
                            emptyTitle="No user statistics"
                            emptyDescription="There are currently no user statistics to display."
                            renderRow={(stat) => (
                                <tr key={stat.userId}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small">
                                                {stat.profilePictureUrl ? <img src={stat.profilePictureUrl} alt="" /> : (stat.username ? stat.username.charAt(0).toUpperCase() : '?')}
                                            </div>
                                            <div className="user-info-cell">
                                                <span className="user-display-name">{stat.displayName || stat.username || 'Deleted User'}</span>
                                                <span className="user-email">{stat.email || ''}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{stat.totalSets?.toLocaleString() || 0}</td>
                                    <td>{stat.totalCards?.toLocaleString() || 0}</td>
                                    <td>{stat.quizCount?.toLocaleString() || stat.quizzesTaken?.toLocaleString() || 0}</td>
                                    <td>
                                        <Badge variant={stat.avgScore && stat.avgScore >= 80 ? 'success' : stat.avgScore >= 50 ? 'warning' : 'error'}>
                                            {stat.avgScore ? `${Number(stat.avgScore).toFixed(1)}%` : 'N/A'}
                                        </Badge>
                                    </td>
                                    <td>{formatDate(stat.lastActiveAt)}</td>
                                </tr>
                            )}
                        />
                        <Pagination
                            currentPage={userStatsPage}
                            totalPages={userStatsTotalPages}
                            onPageChange={setUserStatsPage}
                        />
                    </Card>
                </div>
            );
        } else if (activeView === 'flashcards') {
            return (
                <div className="admin-tab-content w-full">
                    <Card className="user-list-card w-full mb-6">
                        <div className="card-header-flex">
                            <h2>Flashcard Set Statistics</h2>
                            <Button variant="ghost" size="sm" onClick={fetchFlashcardStats}>Refresh</Button>
                        </div>
                        <Table
                            columns={['Set Title', 'Owner', 'Views', 'Quizzes Taken', 'Avg Retention', 'Last Viewed']}
                            isLoading={isFlashcardStatsLoading}
                            data={flashcardStats}
                            emptyIcon={BarChart}
                            emptyTitle="No flashcard statistics"
                            emptyDescription="There are currently no flashcard statistics to display."
                            renderRow={(stat) => (
                                <tr key={stat.setId}>
                                    <td className="font-semibold">{stat.title || 'Unknown Set'}</td>
                                    <td>
                                        {stat.ownerDisplayName ? `${stat.ownerDisplayName} (@${stat.ownerUsername})` : 'System'}
                                    </td>
                                    <td>{stat.viewCount?.toLocaleString() || 0}</td>
                                    <td>{stat.quizCount?.toLocaleString() || 0}</td>
                                    <td>
                                        <Badge variant="info">
                                            {stat.retentionRate ? `${stat.retentionRate}%` : 'N/A'}
                                        </Badge>
                                    </td>
                                    <td>{formatDate(stat.lastViewedAt)}</td>
                                </tr>
                            )}
                        />
                        <Pagination
                            currentPage={flashcardStatsPage}
                            totalPages={flashcardStatsTotalPages}
                            onPageChange={setFlashcardStatsPage}
                        />
                    </Card>
                </div>
            );
        } else {
            return (
                <div className="admin-tab-content w-full">
                    <Card className="user-list-card w-full mb-6">
                        <div className="card-header-flex">
                            <h2>Class Statistics</h2>
                            <Button variant="ghost" size="sm" onClick={fetchClassStats}>Refresh</Button>
                        </div>
                        <Table
                            columns={['Class Title', 'Owner', 'Members', 'Materials', 'Status', 'Created At']}
                            isLoading={isClassStatsLoading}
                            data={classStats}
                            emptyIcon={GraduationCap}
                            emptyTitle="No class statistics"
                            emptyDescription="There are currently no class statistics to display."
                            renderRow={(stat) => (
                                <tr key={stat.classId}>
                                    <td className="font-semibold">{stat.className || 'Unknown Class'}</td>
                                    <td>
                                        {stat.ownerDisplayName ? `${stat.ownerDisplayName} (@${stat.ownerUsername})` : 'System'}
                                    </td>
                                    <td>{stat.memberCount?.toLocaleString() || 0}</td>
                                    <td>{stat.materialCount?.toLocaleString() || 0}</td>
                                    <td>
                                        <Badge variant={stat.status === 'APPROVED' ? 'success' : stat.status === 'PENDING' ? 'warning' : 'error'}>
                                            {stat.status || 'UNKNOWN'}
                                        </Badge>
                                    </td>
                                    <td>{formatDate(stat.createdAt)}</td>
                                </tr>
                            )}
                        />
                        <Pagination
                            currentPage={classStatsPage}
                            totalPages={classStatsTotalPages}
                            onPageChange={setClassStatsPage}
                        />
                    </Card>
                </div>
            );
        }
    };

    return (
        <div className="admin-container stats-page-container" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
            {/* Dashboard Header Section with Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Platform Overview</h2>
                
                {/* Top Navigation Cards moved to header */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '10px' }}>
                    <button 
                        onClick={() => navigate('/admin/stats/users')}
                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', backgroundColor: activeView === 'users' ? '#ffffff' : 'transparent', color: activeView === 'users' ? '#2563eb' : '#64748b', boxShadow: activeView === 'users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <TrendingUp size={16} />
                        <span>User Statistics</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin/stats/flashcards')}
                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', backgroundColor: activeView === 'flashcards' ? '#ffffff' : 'transparent', color: activeView === 'flashcards' ? '#2563eb' : '#64748b', boxShadow: activeView === 'flashcards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <BookOpen size={16} />
                        <span>Flashcard Statistics</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin/stats/classes')}
                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', backgroundColor: activeView === 'classes' ? '#ffffff' : 'transparent', color: activeView === 'classes' ? '#2563eb' : '#64748b', boxShadow: activeView === 'classes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <GraduationCap size={16} />
                        <span>Class Statistics</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Summary Cards */}
            <div style={{ width: '100%', marginBottom: '24px' }}>
                {summary && activeView === 'users' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', color: '#3b82f6', flexShrink: 0 }}>
                                <Users size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Total Users</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.totalUsers}</span>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5', color: '#10b981', flexShrink: 0 }}>
                                <UserPlus size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>New Users (30d)</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.newUsers}</span>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff1f2', color: '#f43f5e', flexShrink: 0 }}>
                                <Mail size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Google Registrations</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.googleUsers}</span>
                            </div>
                        </Card>
                    </div>
                )}
                
                {summary && activeView === 'flashcards' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', color: '#3b82f6', flexShrink: 0 }}>
                                <BookOpen size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Total Sets</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.totalSets}</span>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5', color: '#10b981', flexShrink: 0 }}>
                                <TrendingUp size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Total Views</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.totalViews}</span>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef3c7', color: '#d97706', flexShrink: 0 }}>
                                <Users size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Total Quizzes Taken</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.totalQuizzes}</span>
                            </div>
                        </Card>
                    </div>
                )}
                
                {summary && activeView === 'classes' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', color: '#3b82f6', flexShrink: 0 }}>
                                <GraduationCap size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Total Classes</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.totalClasses}</span>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5', color: '#10b981', flexShrink: 0 }}>
                                <Users size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Active Classes</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.activeClasses}</span>
                            </div>
                        </Card>
                        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef3c7', color: '#d97706', flexShrink: 0 }}>
                                <BookOpen size={28} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Total Materials</span>
                                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0 0 0' }}>{summary.totalMaterials}</span>
                            </div>
                        </Card>
                    </div>
                )}
                {summary && (summary.registrationChartData || summary.creationChartData) && (
                    <Card style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                                {activeView === 'users' ? 'Registration Trend' : activeView === 'flashcards' ? 'Flashcard Creation Trend' : 'Class Creation Trend'}
                            </h3>
                            <select 
                                value={chartDays} 
                                onChange={handleDaysChange}
                                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '14px', color: '#334155', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={14}>Last 14 Days</option>
                                <option value={30}>Last 30 Days</option>
                            </select>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer>
                                <AreaChart data={summary.registrationChartData || summary.creationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey={activeView === 'users' ? "newUsers" : activeView === 'flashcards' ? "newSets" : "newClasses"} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNewUsers)" name={activeView === 'users' ? "New Users" : activeView === 'flashcards' ? "New Sets" : "New Classes"} />
                                    <Brush dataKey="date" height={30} stroke="#6366f1" fill="#f8fafc" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}
            </div>

            {/* Main Content Area */}
            <div className="stats-content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default StatisticsPage;
