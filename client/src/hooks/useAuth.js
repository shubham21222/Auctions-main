// hooks/useAuth.js
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPasswordResetToken } from '@/redux/authSlice';
import config from '@/app/config_BASE_URL';

const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const dispatch = useDispatch(); // Get the dispatch function

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      console.log('Verifying token...');

      if (!token) {
        console.log('No token found. User is not authenticated.');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Sending token to backend for verification:', token);

        const response = await axios.post(
          `${config.baseURL}/v1/api/auth/verify/${token}`,
          {},
          {
            headers: { Authorization: `${token}` },
          }
        );

        console.log('Backend verification response:', response.data);

        // Check for status: true in the response
        setIsAuthenticated(response.data.status === true);

        // Save the passwordResetToken to Redux if it exists
        if (response.data.items?.passwordResetToken) {
          dispatch(setPasswordResetToken(response.data.items.passwordResetToken));
        }

        // Log the authentication result
        console.log('Authentication result:', {
          responseStatus: response.data.status,
          isNowAuthenticated: response.data.status === true,
        });

      } catch (error) {
        console.error('Error during token verification:', error.response?.data || error.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Start verification immediately
    verifyToken();
  }, [token, dispatch]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Auth State Updated:', {
      token: token ? 'present' : 'absent',
      isAuthenticated,
      loading
    });
  }, [token, isAuthenticated, loading]);

  return { isAuthenticated, loading };
};

export default useAuth;