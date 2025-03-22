
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
}

const AuthLayout = ({ children, title, description, footer }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/20">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold text-primary">Wedding Admin</h2>
            </Link>
            <h1 className="mt-6 text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
          
          <div className="space-y-6">
            {children}
          </div>
          
          {footer && (
            <div className={cn("mt-6 text-center text-sm", !footer && "hidden")}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
