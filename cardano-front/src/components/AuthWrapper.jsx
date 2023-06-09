import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthWrapper = ({ children }) => {
    const auth = getAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/', {
                    replace: true,
                    state: { from: location.pathname + location.search },
                });
            }
        });

        return () => unsubscribe();
    }, [auth, navigate, location]);


    return <>{children}</>;
};

export default AuthWrapper;
