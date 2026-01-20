import app from "./app";
import config from "./config/config";
import connectDB from "./config/database.config";

connectDB();  

app.listen(config.port, () => {
  console.log(`Server running on port http://localhost:${config.port}...`);
});