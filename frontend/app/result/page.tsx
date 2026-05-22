
'use client';

import { useSearchParams } from 'next/navigation';
import ResultPage from '@/components/product/ResultPage';

export default function ResultRoute() {
  const params = useSearchParams();
  const verificationId = params.get('id') ?? '';

  return <ResultPage verificationId={verificationId} />;
}