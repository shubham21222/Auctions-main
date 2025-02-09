// hooks/usePasswordReset.js
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const usePasswordReset = () => {
  const auth = useSelector((state) => state.auth); // Get the auth state from Redux
  const [resetToken, setResetToken] = useState(null);

  // Debugging: Log the entire auth state
  console.log("Auth State:", auth);

  useEffect(() => {
    // Debugging: Log when the effect runs
    console.log("useEffect triggered. Checking for passwordResetToken...");

    // Extract the reset token from the auth state
    if (auth?.items?.passwordResetToken) {
      console.log("Password Reset Token Found:", auth.items.passwordResetToken);
      setResetToken(auth.items.passwordResetToken);
    } else {
      console.log("No passwordResetToken found in auth state.");
    }
  }, [auth]); // Dependency array ensures this runs whenever `auth` changes

  // Debugging: Log the current resetToken value
  console.log("Current Reset Token:", resetToken);

  return { resetToken };
};

export default usePasswordReset;