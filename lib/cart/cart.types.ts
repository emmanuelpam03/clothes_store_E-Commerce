export type CartItem = {
  id: string;        // productId (from DB)
  title: string;
  subtitle: string;
  price: number;
  image: string | null;
  size: string;
  color: string;
  qty: number;
};
