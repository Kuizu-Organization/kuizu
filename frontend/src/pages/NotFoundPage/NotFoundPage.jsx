import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import './NotFoundPage.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-code">404</div>

                <div className="illustration-wrapper">
                    <div className="icon-pulse">
                        <AlertTriangle size={80} className="warning-icon" />
                    </div>
                </div>

                <h1>Page Not Found</h1>
                <p>
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Please check the URL or head back to the dashboard.
                </p>

                <div className="not-found-actions">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard')}
                        className="home-btn"
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="back-btn"
                    >
                        <ChevronLeft size={18} />
                        Go Back
                    </Button>
                </div>
            </div>

            <div className="bg-decorations">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
        </div>
    );
};

export default NotFoundPage;
