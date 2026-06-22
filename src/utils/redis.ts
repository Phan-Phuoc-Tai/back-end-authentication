import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://localhost:6380", //dùng chuỗi kết nối vì khác port 6379
}).on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

//localhost, port phải để vào file env
