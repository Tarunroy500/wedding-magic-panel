
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Grid3X3, 
  ImagePlus, 
  Layers, 
  FolderPlus,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Grid3X3 size={20} /> },
    // { path: '/admin/hero', label: 'Hero Sections', icon: <ImagePlus size={20} /> },
    { path: '/admin/categories', label: 'Categories', icon: <FolderPlus size={20} /> },
    { path: '/admin/albums', label: 'Albums', icon: <Layers size={20} /> },
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex bg-secondary/40">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-glass h-screen flex flex-col border-r border-border relative transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[80px]" : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-border h-16">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg text-foreground flex items-center"
            >
              Wedding Admin
            </motion.div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-2 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 font-medium button-animation",
                      location.pathname === item.path && "bg-accent text-accent-foreground",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                  >
                    {item.icon}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-3",
                  sidebarCollapsed && "justify-center px-2"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && <span>{user?.name || 'Admin'}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="h-16 border-b border-border bg-glass/80 backdrop-blur-sm sticky top-0 z-10 flex items-center px-6">
          <h1 className="text-xl font-semibold text-foreground">
            {navItems.find(item => item.path === location.pathname)?.label || 'Wedding Admin Panel'}
          </h1>
        </div>
        <div className="p-6 max-w-7xl mx-auto animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
