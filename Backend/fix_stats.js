const mongoose = require('mongoose');
const Review = require('./Models/Review.Model');
const Product = require('./Models/Product.Model');
const dotenv = require('dotenv');

dotenv.config();

const DB_URL = process.env.DB_URL;

async function fixStats() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Processing ${products.length} products...`);

    for (const product of products) {
      const reviews = await Review.find({ product: product._id, status: "approved" });
      
      const reviewCount = reviews.length;
      let ratingAverage = 0;
      
      if (reviewCount > 0) {
        const totalRating = reviews.reduce((sum, rev) => sum + (Number(rev.rating) || 0), 0);
        ratingAverage = totalRating / reviewCount;
      }

      await Product.findByIdAndUpdate(product._id, {
        reviewCount: reviewCount,
        ratingAverage: Math.round(ratingAverage * 10) / 10,
        reviews: reviews.map(r => r._id)
      });

      if (reviewCount > 0) {
          console.log(`Updated ${product.name}: count=${reviewCount}, avg=${ratingAverage.toFixed(1)}`);
      }
    }

    console.log("Stats fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing stats:", error);
    process.exit(1);
  }
}

fixStats();
