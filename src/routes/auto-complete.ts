import { AxiosError } from "axios";
import express from "express";
import { Request, Response, NextFunction } from "express";
import { bayutFetch } from "./../lib/fetch";
import { redisClient as client } from "./../app";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const { location } = req.query;
  if (location) {
    const chachedLocation = await client.get(location as string);
    if (chachedLocation) {
      console.log(
        `[${req.method}][🚀chached]: ${req.url} ${new Date().toLocaleTimeString(
          "en-us",
          {
            timeStyle: "medium",
          }
        )}`
      );
      return res.json(JSON.parse(chachedLocation));
    }
    try {
      const response = await bayutFetch.get("/auto-complete", {
        params: { query: location, hitsPerPage: "5", page: "0", lang: "en" },
      });
      await client.setex(location as string, 3600 * 24, JSON.stringify(response.data));
      return res.status(200).json(response.data);
    } catch (err: unknown) {
      const error = err as AxiosError;
      const { message } = error.response?.data as { message: string };
      return res.status(error.response?.status || 500).send(message);
    }
  }

  return res.status(400).send("Query is require");
});

module.exports = router;
