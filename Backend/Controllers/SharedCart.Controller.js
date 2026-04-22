const SharedCartService = require("../Services/SharedCartService");

const shareCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await SharedCartService.shareCart(userId);
    res.status(200).json({
      success: true,
      message: "Cart shared successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const openSharedCart = async (req, res) => {
  try {
    const { shareId } = req.params;
    const friendUserId = req.user?.userId || req.query.friendUserId; // Handle both auth and query param
    
    const data = await SharedCartService.openSharedCart(shareId, friendUserId);
    res.status(200).json({
      success: true,
      message: "Shared cart loaded",
      data
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const addSharedItemsToOwnCart = async (req, res) => {
  try {
    const { shareId } = req.params;
    const friendUserId = req.user.userId;

    const result = await SharedCartService.addSharedCartToOwnCart(shareId, friendUserId);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  shareCart,
  openSharedCart,
  addSharedItemsToOwnCart
};
