import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#111c30] border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Brand & Copyright */}
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start">
            <Link to="/" className="flex items-center select-none">
              <span className="font-black italic text-base tracking-wider uppercase font-sans">
                <span className="text-[#00a8ff]">FALCON</span>
                <span className="text-slate-900 dark:text-white ml-1.5">FORECAST</span>
              </span>
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Falcon Forecast. Please gamble responsibly. 18+</p>
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

        <nav aria-label="Social media" className="flex flex-wrap items-center justify-center gap-2 font-semibold">
          <a href="https://x.com/falconforecasts" target="_blank" rel="noopener noreferrer" aria-label="Falcon Forecast on X" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-[#00a8ff] hover:border-[#00a8ff] transition-colors">
            <span aria-hidden="true" className="font-black">X</span> X
          </a>
          <a href="https://www.instagram.com/falconforecasts/" target="_blank" rel="noopener noreferrer" aria-label="Falcon Forecast on Instagram" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-[#00a8ff] hover:border-[#00a8ff] transition-colors">
            <span aria-hidden="true" className="font-black">IG</span> Instagram
          </a>
          <a href="https://www.tiktok.com/@falconforecast" target="_blank" rel="noopener noreferrer" aria-label="Falcon Forecast on TikTok" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-[#00a8ff] hover:border-[#00a8ff] transition-colors">
            <span aria-hidden="true" className="font-black">♪</span> TikTok
          </a>
          <a href="https://www.facebook.com/share/1CFs3c4hKp/" target="_blank" rel="noopener noreferrer" aria-label="Falcon Forecast on Facebook" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-[#00a8ff] hover:border-[#00a8ff] transition-colors">
            <span aria-hidden="true" className="font-black">f</span> Facebook
          </a>
        </nav>
      </div>
    </footer>
  );
};
