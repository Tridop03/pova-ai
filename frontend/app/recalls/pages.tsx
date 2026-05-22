
import RecallList from '@/components/recalls/RecallList';
import RecallSearchBar from '@/components/recalls/RecallSearchBar';
import RecallFilterBar from '@/components/recalls/RecallFilterBar';

export default function RecallsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Recalled Products</h1>
      <p className="text-gray-500 mb-10">
        Products officially recalled or flagged by POVA AI administrators.
      </p>
      <RecallSearchBar />
      <RecallFilterBar />
      <RecallList />
    </div>
  );
}