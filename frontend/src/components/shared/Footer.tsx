import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Copyright */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold text-slate-800">SportSync</span>
          <span>© 2025 SportSync Multi-Venue Network. All rights reserved.</span>
        </div>

        {/* Footer Links */}
        <div className="flex items-center space-x-6">
          <a href="#vietqr" className="hover:text-emerald-600 transition-colors">
            VietQR Automation
          </a>
          <a href="#partners" className="hover:text-emerald-600 transition-colors">
            Venue Partners
          </a>
          <a href="#terms" className="hover:text-emerald-600 transition-colors">
            Terms of Service
          </a>
          <a href="#support" className="hover:text-emerald-600 transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};
