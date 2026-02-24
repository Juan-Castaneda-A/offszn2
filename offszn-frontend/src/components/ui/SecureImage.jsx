import React from 'react';
import { useSecureUrl } from '../../hooks/useSecureUrl';

/**
 * Reusable image component that handles R2 signed URLs and loading states.
 * Standardizes image loading across the application.
 */
const SecureImage = ({ src, alt, className, skeletonClassName = "w-full h-full bg-zinc-800 animate-pulse" }) => {
    const { url: secureUrl, loading } = useSecureUrl(src);

    if (loading) {
        return <div className={skeletonClassName} />;
    }

    return (
        <img
            src={secureUrl || '/placeholder.jpg'}
            alt={alt || ''}
            className={className}
            onError={(e) => {
                if (e.target.src !== '/placeholder.jpg') {
                    e.target.src = '/placeholder.jpg';
                }
            }}
        />
    );
};

export default SecureImage;
