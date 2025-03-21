"use client";
import React from "react";
import SignIn from "./LoginForm";
import SignUp from "./SignUpForm";

interface AuthPopupProps {
  onClose: () => void;
  isSignUp: boolean;
  toggleAuth: () => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ onClose, isSignUp, toggleAuth }) => {
  return (
    <div className="fixed inset-0 z-[100]  flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg  p-6 shadow-xl transition-all duration-300 ease-in-out">
        {isSignUp ? (
          <SignUp onClose={onClose} />
        ) : (
          <SignIn onClose={onClose}  />
        )}
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
          </span>
          <button
            onClick={toggleAuth}
            className="text-blue-500 hover:text-blue-800 font-bold hover:underline focus:outline-none"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
