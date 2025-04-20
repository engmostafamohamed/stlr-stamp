import connectDB from "./config/database";
import app from "./app"; // Your Express app

const PORT = process.env.PORT || 8080;

// Connect to database and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });