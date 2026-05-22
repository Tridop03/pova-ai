
export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
      <p className="text-gray-500 mb-8">
        This product isn't in our database yet. Help us grow by submitting it for review.
      </p>
      <a
        href="/support"
        className="bg-brand-purple text-white px-8 py-4 rounded-full font-bold inline-block"
      >
        Submit for review
      </a>
    </div>
  );
}