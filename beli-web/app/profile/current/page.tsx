import { redirect } from 'next/navigation';

import { UserService } from '@/lib/services';

export default async function CurrentProfilePage() {
  // Fetch the current user
  const currentUser = await UserService.getCurrentUser();

  // If no current user, redirect to home or login
  if (!currentUser) {
    redirect('/');
  }

  // Redirect to the current user's profile page
  redirect(`/profile/${currentUser.username}`);
}
