import cron from "cron";
import https from "https";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const API_URL = process.env.API_URL;

if (!API_URL) {
    console.error("❌ API_URL is not defined in the environment variables.");
    process.exit(1); // Exit if API_URL is missing
}

const job = new cron.CronJob("*/14 * * * *", function () {
    https
        .get(API_URL, (res) => {
            if (res.statusCode === 200) {
                console.log("✅ GET request sent successfully");
            } else {
                console.error(`⚠️ GET request failed with status: ${res.statusCode}`);
            }
        })
        .on("error", (e) => console.error("❌ Error while sending request:", e.message));
});

export default job;