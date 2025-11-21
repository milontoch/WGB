/**
 * Product Database Queries
 * All database operations for e-commerce products, cart, orders, reviews
 */

import { supabaseAdmin } from "../supabase/admin";
import type {
  Product,
  CartItem,
  Order,
  OrderItem,
  Review,
} from "../supabase/config";

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/**
 * Get all active products
 */
export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all products (including inactive - for admin)
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }

  return data || [];
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }

  return data || [];
}

/**
 * Check product stock availability
 */
export async function checkStock(
  productId: string,
  quantity: number
): Promise<boolean> {
  const product = await getProductById(productId);
  if (!product) return false;

  return product.stock >= quantity;
}

/**
 * Update product stock (decrease after order)
 */
export async function updateProductStock(
  productId: string,
  quantityChange: number
): Promise<boolean> {
  // Get current stock
  const product = await getProductById(productId);
  if (!product) return false;

  const newStock = product.stock + quantityChange; // Use negative value to decrease
  if (newStock < 0) return false;

  const { error } = await supabaseAdmin
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId);

  if (error) {
    console.error("Error updating stock:", error);
    return false;
  }

  return true;
}

// ============================================================================
// CART QUERIES
// ============================================================================

/**
 * Get user's cart with product details
 */
export async function getUserCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabaseAdmin
    .from("cart")
    .select(
      `
      *,
      product:products(*)
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  return data || [];
}

/**
 * Add item to cart (or update quantity if exists)
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItem | null> {
  // Check if item already in cart
  const { data: existing } = await supabaseAdmin
    .from("cart")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    // Update quantity
    const newQuantity = existing.quantity + quantity;
    const { data, error } = await supabaseAdmin
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating cart:", error);
      return null;
    }
    return data;
  }

  // Insert new item
  const { data, error } = await supabaseAdmin
    .from("cart")
    .insert({ user_id: userId, product_id: productId, quantity })
    .select()
    .single();

  if (error) {
    console.error("Error adding to cart:", error);
    return null;
  }

  return data;
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("cart")
    .update({ quantity })
    .eq("id", cartItemId);

  if (error) {
    console.error("Error updating cart quantity:", error);
    return false;
  }

  return true;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("cart")
    .delete()
    .eq("id", cartItemId);

  if (error) {
    console.error("Error removing from cart:", error);
    return false;
  }

  return true;
}

/**
 * Clear entire cart for user
 */
export async function clearCart(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("cart")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing cart:", error);
    return false;
  }

  return true;
}

// ============================================================================
// ORDER QUERIES
// ============================================================================

/**
 * Create order with items
 */
export async function createOrder(
  orderData: Omit<Order, "id" | "created_at" | "updated_at">,
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[]
): Promise<Order | null> {
  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (orderError || !order) {
    console.error("Error creating order:", orderError);
    return null;
  }

  // Create order items
  const orderItems = items.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    // Rollback order creation
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return null;
  }

  // Update product stock
  for (const item of items) {
    if (item.product_id) {
      await updateProductStock(item.product_id, -item.quantity);
    }
  }

  return order;
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data || [];
}

/**
 * Get order by ID with items
 */
export async function getOrderById(
  orderId: string
): Promise<(Order & { items: OrderItem[] }) | null> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Error fetching order:", orderError);
    return null;
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("Error fetching order items:", itemsError);
    return null;
  }

  return { ...order, items: items || [] };
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: Order["payment_status"],
  paymentReference?: string
): Promise<boolean> {
  const updateData: any = { payment_status: paymentStatus };
  if (paymentReference) {
    updateData.payment_reference = paymentReference;
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    console.error("Error updating payment status:", error);
    return false;
  }

  return true;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  orderStatus: Order["order_status"]
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ order_status: orderStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    return false;
  }

  return true;
}

// ============================================================================
// REVIEW QUERIES
// ============================================================================

/**
 * Get approved reviews for a product
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select(
      `
      *,
      user:profiles(full_name, email)
    `
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return data || [];
}

/**
 * Get average rating for a product
 */
export async function getProductAverageRating(
  productId: string
): Promise<number> {
  const reviews = await getProductReviews(productId);
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Create review
 */
export async function createReview(
  productId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<Review | null> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment || null,
      is_approved: false, // Requires admin approval
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return null;
  }

  return data;
}

/**
 * Get all reviews (for admin)
 */
export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select(
      `
      *,
      user:profiles(full_name, email),
      product:products(name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }

  return data || [];
}

/**
 * Approve/reject review
 */
export async function updateReviewApproval(
  reviewId: string,
  isApproved: boolean
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ is_approved: isApproved })
    .eq("id", reviewId);

  if (error) {
    console.error("Error updating review approval:", error);
    return false;
  }

  return true;
}
