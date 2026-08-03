import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#111c30] border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Brand & Copyright */}
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img src="/logo.png" alt="Falcon Forecast" className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:brightness-125 dark:contrast-125" />
          </div>
          <p>© 2024 Falcon Forecast. Please gamble responsibly. 18+</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
          <Link to="/terms" className="hover:text-[#00a8ff] transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-[#00a8ff] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/gdpr" className="hover:text-[#00a8ff] transition-colors">
            Gambling Help
          </Link>
          <Link to="/about" className="hover:text-[#00a8ff] transition-colors">
            About Us
          </Link>
          <Link to="/terms" className="hover:text-[#00a8ff] transition-colors">
            Affiliates
          </Link>
        </div>
      </div>
    </footer>
  );
};
