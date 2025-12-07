const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('./models/Book');

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of decadence and excess, The Great Gatsby explores the darker aspects of the American Dream.",
    isbn: "9780743273565",
    price: 12.99,
    quantity: 10,
    category: "Fiction",
    coverImage: "https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A powerful story of racial injustice and the loss of innocence in the American South.",
    isbn: "9780061120084",
    price: 10.99,
    quantity: 8,
    category: "Fiction",
    coverImage: "https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
    isbn: "9780062316097",
    price: 15.99,
    quantity: 15,
    category: "Non-Fiction",
    coverImage: "https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    description: "A practical guide to programming techniques that emphasizes the importance of writing clean, maintainable code.",
    isbn: "9780201616224",
    price: 29.99,
    quantity: 20,
    category: "Technology",
    coverImage: "https://m.media-amazon.com/images/I/71f743sOPoL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    description: "A deeply personal memoir by the former First Lady of the United States, chronicling her journey from the South Side of Chicago to the White House.",
    isbn: "9781524763138",
    price: 18.99,
    quantity: 12,
    category: "Biography",
    coverImage: "https://m.media-amazon.com/images/I/81h2gWPTYJL._AC_UF1000,1000_QL80_.jpg"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Add sample books
    const createdBooks = await Book.insertMany(sampleBooks);
    console.log(`Added ${createdBooks.length} books to the database`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
