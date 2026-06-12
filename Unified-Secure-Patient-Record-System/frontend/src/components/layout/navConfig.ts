import type { ElementType } from 'react';
import {
  Shield, LayoutDashboard, Users, FileText,
  ArrowLeftRight, Lock, UserCog, Settings, Sparkles,
} from 'lucide-react';
import type { UserRole } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  shortLabel?: string;
  Icon: ElementType;
  roles: UserRole[];
  bottomNav?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', Icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'patient'], bottomNav: true },
  { to: '/timeline', label: 'My Timeline', shortLabel: 'Timeline', Icon: FileText, roles: ['patient'], bottomNav: true },
  { to: '/patients', label: 'Patients', shortLabel: 'Patients', Icon: Users, roles: ['admin', 'doctor', 'nurse'], bottomNav: true },
  { to: '/records', label: 'Records', shortLabel: 'Records', Icon: FileText, roles: ['admin', 'doctor', 'nurse'], bottomNav: true },
  { to: '/ai-health', label: 'AI Health Guide', shortLabel: 'AI', Icon: Sparkles, roles: ['admin', 'doctor', 'nurse', 'patient'] },
  { to: '/exchange', label: 'Exchange', shortLabel: 'Exchange', Icon: ArrowLeftRight, roles: ['admin', 'doctor'] },
  { to: '/encryption', label: 'Encryption Lab', shortLabel: 'Crypto', Icon: Lock, roles: ['admin', 'doctor'] },
  { to: '/audit', label: 'Audit Trail', shortLabel: 'Audit', Icon: Shield, roles: ['admin'] },
  { to: '/users', label: 'User Management', shortLabel: 'Users', Icon: UserCog, roles: ['admin'] },
  { to: '/settings', label: 'Settings', shortLabel: 'Settings', Icon: Settings, roles: ['admin', 'doctor', 'nurse', 'patient'], bottomNav: true },
];

export function navForRole(role: UserRole | undefined): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter(n => n.roles.includes(role));
}

export function bottomNavForRole(role: UserRole | undefined): NavItem[] {
  const items = navForRole(role).filter(n => n.bottomNav);
  return items.slice(0, 5);
}
