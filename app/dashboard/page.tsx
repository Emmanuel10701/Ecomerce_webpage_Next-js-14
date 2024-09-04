'use client';

import Sidebar from '@/components/sidebar/page';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>; // Show a loading state while session data is being fetched
  }

  if (!session) {
    router.push('/login'); // Redirect to the login page if not authenticated
    return null; // Prevent rendering the rest of the page
  }

  return (
    <div className="flex">
      {session ? <Sidebar /> : null} {/* Conditionally render Sidebar */}
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2">Hi {session.user?.email}</p>
        <button
          onClick={() => signOut()}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </main>
    </div>
  );
};

export default Dashboard;
