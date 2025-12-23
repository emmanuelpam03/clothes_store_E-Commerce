export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <h1>Product: {params.slug}</h1>
    </div>
  );
}
