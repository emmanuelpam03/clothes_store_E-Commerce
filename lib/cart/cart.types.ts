export type CartItem = {
  id: string; // CartItem ID (cuid)
  productId: string; // Product ID
  title: string;
  subtitle: string;
  price: number;
  image: string | null;
  size: string;
  color: string;
  qty: number;
};
