import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  HeartHandshake,
  Bell,
  Menu,
  X,
  User,
  ShieldCheck,
  CheckCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentRole,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    activeTab,
    setActiveTab,
    resetToSampleData
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'equipment', label: 'Medical Equipment' },
    { id: 'medicines', label: 'Leftover Medicines' },
    { id: 'requests', label: 'Assistance' },
    { id: 'blood-donors', label: 'Blood Donors' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'safe-medicine', label: 'Safe Disposal' },
    { id: 'supplies', label: 'Supplies' },
    { id: 'about', label: 'About' },
  ];

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setRoleMenuOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return 'Patient / Seeker';
      case 'donor':
        return 'Equipment & Blood Donor';
      case 'ngo':
        return 'Verified NGO Coordinator';
      case 'admin':
        return 'System Administrator';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-700 transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-slate-900 whitespace-nowrap">
                MediShare
              </span>
            </button>
            <span className="hidden xl:inline text-xs font-medium text-slate-400 border-l border-slate-200 pl-2.5">
              CSE Mini Project Demo
            </span>
          </div>

          {/* Zone 2: 4-6 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
            {navLinks.filter((item) => item.id !== 'about').map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`whitespace-nowrap transition-colors py-1 relative cursor-pointer ${
                  activeTab === item.id
                    ? 'text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveTab('about');
                setMobileMenuOpen(false);
              }}
              className={`whitespace-nowrap transition-colors py-1 relative cursor-pointer ${
                activeTab === 'about'
                  ? 'text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              About
            </button>
          </nav>

          {/* Zone 3: 1 primary action & role switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="View notifications"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800">In-App Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-teal-700 hover:underline font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkTab) setActiveTab(n.linkTab);
                            setNotifOpen(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                            !n.read ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
                              {n.timestamp.split(' ')[1] || n.timestamp}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="hidden sm:inline text-slate-500">Role:</span>
                <span className="font-semibold">{getRoleBadge(currentUser.role)}</span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => handleRoleChange('patient')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'patient'
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div>Patient / Requester</div>
                      <div className="text-[10px] text-slate-400">Aarav Sharma (Mumbai)</div>
                    </div>
                    {currentUser.role === 'patient' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('donor')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'donor'
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div>Equipment & Blood Donor</div>
                      <div className="text-[10px] text-slate-400">Dr. Priya Desai (Bengaluru)</div>
                    </div>
                    {currentUser.role === 'donor' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('ngo')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'ngo'
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div>Verified NGO Coordinator</div>
                      <div className="text-[10px] text-slate-400">CareShare Health Foundation</div>
                    </div>
                    {currentUser.role === 'ngo' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'admin'
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div>System Administrator</div>
                      <div className="text-[10px] text-slate-400">Prof. Rajesh Kulkarni</div>
                    </div>
                    {currentUser.role === 'admin' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
                    <button
                      onClick={resetToSampleData}
                      className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer py-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard / My Account Action */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  activeTab === item.id
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-500 mb-2">Switch Active Persona:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  handleRoleChange('patient');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg border text-left ${currentUser.role === 'patient' ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium' : 'border-slate-200'}`}
              >
                Patient
              </button>
              <button
                onClick={() => {
                  handleRoleChange('donor');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg border text-left ${currentUser.role === 'donor' ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium' : 'border-slate-200'}`}
              >
                Donor
              </button>
              <button
                onClick={() => {
                  handleRoleChange('ngo');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg border text-left ${currentUser.role === 'ngo' ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium' : 'border-slate-200'}`}
              >
                NGO
              </button>
              <button
                onClick={() => {
                  handleRoleChange('admin');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg border text-left ${currentUser.role === 'admin' ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium' : 'border-slate-200'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
