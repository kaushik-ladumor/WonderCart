const validateDealMargin = (req, res, next) => {
  const { dealPrice, costPrice, commissionPercent = 10 } = req.body;

  if (!dealPrice || !costPrice) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing for margin validation."
    });
  }

  const sellerReceives = dealPrice - (dealPrice * commissionPercent / 100);

  if (sellerReceives <= costPrice) {
    return res.status(400).json({
      success: false,
      message: "Deal rejected: seller would lose money. Reduce discount or increase MRP."
    });
  }

  const profit = sellerReceives - costPrice;
  const margin = (profit / dealPrice) * 100;

  if (margin < 5) {
    req.marginWarning = "Low margin warning: your profit margin for this deal is below 5%.";
  }

  next();
};

module.exports = validateDealMargin;
