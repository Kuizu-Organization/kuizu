import { useNavigate, useSearchParams } from 'react-router-dom';
import { ComingSoonModal } from '@/components/ui';
import MainLayout from '@/components/layout';

const ComingSoonPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const featureName = searchParams.get('feature') || 'This page';

    const handleClose = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <MainLayout>
            <ComingSoonModal
                isOpen={true}
                onClose={handleClose}
                featureName={featureName}
            />
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--text-light)', opacity: 0.5 }}>Loading feature...</h1>
            </div>
        </MainLayout>
    );
};

export default ComingSoonPage;
