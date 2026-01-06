import ProductInfo from "@/components/shop/ProductInfo";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // const {slug} = await params
  return (
    <div>
      <h1><ProductInfo /></h1>
    </div>
  );
}
