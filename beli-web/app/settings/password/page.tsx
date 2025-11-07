'use client';

import { ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const isValid =
    hasMinLength && hasUppercase && hasNumber && passwordsMatch && currentPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      alert('Please meet all password requirements');
      return;
    }

    setIsSubmitting(true);

    // TODO: Implement actual password change
    setTimeout(() => {
      alert('Your password has been changed successfully');
      setIsSubmitting(false);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings/account">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Change Password</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-2"
              />
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-2"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-2"
              />
            </div>

            {/* Password Requirements */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Password must include:</p>

              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                    hasMinLength ? 'bg-primary' : 'bg-gray-300'
                  )}
                >
                  {hasMinLength && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    hasMinLength ? 'font-medium text-primary' : 'text-secondary'
                  )}
                >
                  At least 8 characters
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                    hasUppercase ? 'bg-primary' : 'bg-gray-300'
                  )}
                >
                  {hasUppercase && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    hasUppercase ? 'font-medium text-primary' : 'text-secondary'
                  )}
                >
                  Must include uppercase letter
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                    hasNumber ? 'bg-primary' : 'bg-gray-300'
                  )}
                >
                  {hasNumber && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    hasNumber ? 'font-medium text-primary' : 'text-secondary'
                  )}
                >
                  Must include number
                </span>
              </div>

              {confirmPassword && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                      passwordsMatch ? 'bg-primary' : 'bg-gray-300'
                    )}
                  >
                    {passwordsMatch && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                  <span
                    className={cn(
                      'text-sm transition-colors',
                      passwordsMatch ? 'font-medium text-primary' : 'text-secondary'
                    )}
                  >
                    Passwords match
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Saving...' : 'Save Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
