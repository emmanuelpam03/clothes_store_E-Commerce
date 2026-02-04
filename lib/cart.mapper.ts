import type { CartItem } from "./cart.types";

export function mapDbCartToUICart(cart: {
  items: {
    quantity: number;
    product: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      image: string | null;
    };
  }[];
}): CartItem[] {
  return cart.items.map((item) => ({
    id: item.product.id,
    title: item.product.name,
    subtitle: item.product.description ?? "",
    price: item.product.price,
    image: item.product.image ?? "/placeholder.png",
    size: "L",
    color: "#000000",
    qty: item.quantity,
  }));
}
