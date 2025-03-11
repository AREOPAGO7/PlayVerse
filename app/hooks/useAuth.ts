'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/userService';
import { useAuthContext } from '../contexts/AuthContext';
import { createUserInFirestore } from '../services/UserServiceFirebase';
interface AuthError {
  code: string;
  message: string;
}
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuthContext();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      await AuthService.login(email, password);
      router.push('/');
    } catch (err) {
      setError(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError('');
    try {
      const uid = await AuthService.signup(email, password, name);
      router.push('/');
      return uid;
    } catch (err) {
      setError(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const googleSignIn = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await AuthService.googleSignIn();
      console.log('Google Sign In credential:', userCredential);
      const email = userCredential.email;
      const defaultUsername = email ? email.split('@')[0] : 'defaultUser';
        console.log('Creating user in Firestore:', userCredential);
        await createUserInFirestore(
          userCredential.uid,
          defaultUsername
         
        );
     
      router.push('/');
    } catch (err) {
      console.error('Google Sign In error:', err);
      setError(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);



  const githubSignIn = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await AuthService.githubSignIn(); // Call the new GitHub sign-in method
      router.push('/');
    } catch (err) {
      setError(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);


  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      router.push('/');
    } catch (err) {
      setError(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError('');
    try {
      const message = await AuthService.resetPassword(email); // Set success message as error to display it
    } catch (err) {
      setError(AuthService.getErrorMessage(err)); // Use the getErrorMessage method for specific error handling
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    googleSignIn,
    githubSignIn, // Ensure this is included in the return object
    resetPassword, // Added resetPassword to the return object
    setError
  };
}; 