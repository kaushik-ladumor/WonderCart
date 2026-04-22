const SharedCart = require("../Models/SharedCart.Model");
const Cart = require("../Models/Cart.Model");
const User = require("../Models/User.Model");
const Product = require("../Models/Product.Model");
const { sendNotification } = require("../Utils/notificationHelper");
const crypto = require("crypto");

/**
 * shareCart(userId)
 */
const shareCart = async (userId) => {
  try {
    const userCart = await Cart.findOne({ user: userId });
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      throw new Error("Nothing to share: Cart is empty");
    }

    // Capture snapshot
    const snapshotItems = userCart.items.map(item => ({
      productId: item.product,
      productName: item.productName || "Product",
      productImage: item.productImg || "",
      price: item.price || 0,
      quantity: item.quantity,
      isAvailable: true
    }));

    const shareId = crypto.randomUUID();
    const sharedCart = new SharedCart({
      shareId,
      ownerId: userId,
      cartItems: snapshotItems
    });

    await sharedCart.save();
    
    const shareLink = `https://wondercart-customer.netlify.app/cart/share/${shareId}`;
    return { shareId, shareLink, sharedCart };
  } catch (error) {
    console.error("Error in shareCart:", error);
    throw error;
  }
};

/**
 * openSharedCart(shareId, friendUserId)
 */
const openSharedCart = async (shareId, friendUserId) => {
  try {
    const sharedCart = await SharedCart.findOne({ shareId });
    if (!sharedCart) {
      throw new Error("Link is invalid or broken");
    }

    // Increment view
    sharedCart.viewCount += 1;

    // Track user if logged in
    if (friendUserId) {
        const alreadyOpened = sharedCart.openedBy.some(o => o.userId?.toString() === friendUserId.toString());
        if (!alreadyOpened) {
            sharedCart.openedBy.push({ userId: friendUserId, openedAt: new Date() });
        }
    }
    await sharedCart.save();

    // Notify Owner
    await notifyOwner(sharedCart.ownerId, friendUserId);

    // Check if purchased
    if (sharedCart.isCartPurchased) {
      return { 
        isEmpty: true, 
        message: "😔 Oops! These items were already purchased. Cart is now empty.",
        isLoggedIn: !!friendUserId
      };
    }

    return {
      isEmpty: false,
      cartItems: sharedCart.cartItems,
      isLoggedIn: !!friendUserId,
      ownerId: sharedCart.ownerId
    };
  } catch (error) {
    console.error("Error in openSharedCart:", error);
    throw error;
  }
};

/**
 * addSharedCartToOwnCart(shareId, friendUserId)
 */
const addSharedCartToOwnCart = async (shareId, friendUserId) => {
  try {
    const sharedCart = await SharedCart.findOne({ shareId });
    if (!sharedCart) throw new Error("Shared cart find error");
    if (sharedCart.isCartPurchased) throw new Error("Cart is already purchased");

    let friendCart = await Cart.findOne({ user: friendUserId });
    if (!friendCart) {
      friendCart = new Cart({ user: friendUserId, items: [] });
    }

    for (const item of sharedCart.cartItems) {
      // Check if product still exists
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const existingIndex = friendCart.items.findIndex(
        c => c.product?.toString() === item.productId.toString()
      );

      if (existingIndex > -1) {
        friendCart.items[existingIndex].quantity += item.quantity;
      } else {
        friendCart.items.push({
          product: item.productId,
          productName: item.productName,
          productImg: item.productImage,
          price: item.price,
          quantity: item.quantity
        });
      }
    }

    await friendCart.save();
    return { success: true, message: "Added to your cart successfully!" };
  } catch (error) {
    console.error("Error in addSharedCartToOwnCart:", error);
    throw error;
  }
};

/**
 * markCartAsPurchased(ownerId)
 */
const markCartAsPurchased = async (ownerId) => {
  try {
    await SharedCart.updateMany(
      { ownerId, isCartPurchased: false },
      { $set: { isCartPurchased: true } }
    );
  } catch (error) {
    console.error("Error in markCartAsPurchased:", error);
  }
};

/**
 * notifyOwner(ownerId, friendUserId)
 */
const notifyOwner = async (ownerId, friendUserId) => {
  try {
    let viewerName = "Someone (not logged in)";
    if (friendUserId) {
      const friend = await User.findById(friendUserId);
      if (friend) viewerName = friend.username || friend.name || "A friend";
    }

    await sendNotification({
      userId: ownerId,
      role: "user",
      type: "CART_VIEWED",
      title: "🛒 Your cart was viewed!",
      message: `${viewerName} just opened your shared cart on WonderCart!`,
    });
  } catch (error) {
    console.error("Error in notifyOwner:", error);
  }
};

module.exports = {
  shareCart,
  openSharedCart,
  addSharedCartToOwnCart,
  markCartAsPurchased,
  notifyOwner
};
