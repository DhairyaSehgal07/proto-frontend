'use client';

import { useStore } from '@/store'; // adjust path

const Page = () => {
  const { admin, coldStorage } = useStore();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Debug State</h1>

      <section>
        <h2 className="font-medium mb-2">Admin</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(admin, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="font-medium mb-2">Cold Storage</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(coldStorage, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default Page;
