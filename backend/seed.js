const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Product = require("./models/product.model");

const img = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

const products = [
  { name: "Mechanical Keyboard", description: "RGB mechanical keyboard with blue switches.", price: 2999, category: "Electronics", image: img("keyboard"), stock: 10 },
  { name: "Wireless Headphones", description: "Over-ear Bluetooth headphones with noise cancellation and 30-hour battery.", price: 4499, category: "Electronics", image: img("headphones"), stock: 25 },
  { name: "Smart Watch", description: "Fitness tracker with heart-rate monitor, GPS and AMOLED display.", price: 6999, category: "Electronics", image: img("smartwatch"), stock: 15 },
  { name: "Bluetooth Speaker", description: "Portable waterproof speaker with deep bass and 12-hour playtime.", price: 1999, category: "Electronics", image: img("speaker"), stock: 40 },
  { name: "Gaming Mouse", description: "Ergonomic RGB mouse with 16000 DPI and programmable buttons.", price: 1499, category: "Electronics", image: img("mouse"), stock: 30 },
  { name: "Men's Denim Jacket", description: "Classic slim-fit denim jacket, soft cotton blend, all seasons.", price: 2499, category: "Fashion", image: img("jacket"), stock: 20 },
  { name: "Running Shoes", description: "Lightweight breathable sneakers with cushioned sole for daily runs.", price: 3299, category: "Fashion", image: img("shoes"), stock: 35 },
  { name: "Leather Backpack", description: "Water-resistant backpack with laptop compartment and USB charging port.", price: 2799, category: "Fashion", image: img("backpack"), stock: 18 },
  { name: "Atomic Habits", description: "A bestselling guide to building good habits and breaking bad ones.", price: 499, category: "Books", image: img("atomichabits"), stock: 60 },
  { name: "The Alchemist", description: "Paulo Coelho's inspiring novel about following your dreams.", price: 299, category: "Books", image: img("alchemist"), stock: 50 },
  { name: "Table Lamp", description: "Minimal LED desk lamp with adjustable brightness and warm light mode.", price: 899, category: "Home", image: img("lamp"), stock: 45 },
  { name: "Ceramic Coffee Mug Set", description: "Set of 4 handcrafted ceramic mugs, microwave and dishwasher safe.", price: 799, category: "Home", image: img("mugs"), stock: 55 },
  { name: "Cotton Bedsheet Set", description: "Double bedsheet with 2 pillow covers, 100% soft cotton.", price: 1299, category: "Home", image: img("bedsheet"), stock: 28 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    let added = 0;
    for (const item of products) {
      const exists = await Product.findOne({ name: item.name });
      if (!exists) {
        await Product.create(item);
        added++;
      }
    }
    console.log(`Done! ${added} new products added.`);
  } catch (error) {
    console.log("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();