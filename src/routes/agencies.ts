import { AxiosError } from "axios";
import express from "express";
import { Request, Response } from "express";
import { bayutFetch } from "../lib/fetch";
import { redisClient as client } from "./../app";

const router = express.Router();

router.get("/list", async (req: Request, res: Response) => {
  console.log(
    `================================================================`
  );
  

  const { query, page } = req.query;
  const cachedQuery = await client.get(`${query}-${page}-agency-list`);
  if (cachedQuery) {
    console.log(
      `[${req.method}][🚀chached]: ${req.url} ${new Date().toLocaleTimeString(
        "en-us",
        {
          timeStyle: "medium",
        }
      )}`
    );
    return res.json(JSON.parse(cachedQuery));
  }
  try {
    const { data } = await bayutFetch.get(`/agencies/list`, {
      params: { query: query ? query : "*", page },
    });
    if (data.nbHits !== 0) {
      await client.setex(`${query}-${page}-agency-list`, 3600*24, JSON.stringify(data));
    }
    if (data.nbHits === 0) {
      return res.status(404).send(data);
    }
    console.log(
      `[${req.method}][🌏API]: ${req.url} ${new Date().toLocaleTimeString("en-us", {
        timeStyle: "medium",
      })}`
    );
    return res.json(data);
  } catch (err: unknown) {
    const error = err as AxiosError;
    const { message } = error.response?.data as { message: string };
    return res.status(error.response?.status || 500).send(message);
  }
});

// details end point
router.get("/get-listings", async (req: Request, res: Response) => {
  console.log(
    `================================================================`
  );
  console.log(
    `[${req.method}]: ${req.url} ${new Date().toLocaleTimeString("en-us", {
      timeStyle: "medium",
    })}`
  );
  const { page, agencySlug } = req.query;
  const cachedQuery = await client.get(agencySlug);
  if (cachedQuery) {
    console.log(
      `[${req.method}][🚀chached]: ${req.url} ${new Date().toLocaleTimeString(
        "en-us",
        {
          timeStyle: "medium",
        }
      )}`
    );
    return res.json(JSON.parse(cachedQuery));
  }
  try {
    const { data } = await bayutFetch.get(`/agencies/get-listings`, {
      params: { page, agencySlug },
    });
    if (typeof data === "string") {
      return res.status(404).send([]);
    } else {
      await client.setex(agencySlug, 3600*24, JSON.stringify(data));
      return res.json(data);
    }
  } catch (err: unknown) {
    const error = err as AxiosError;
    const { message } = error.response?.data as { message: string };
    return res.status(error.response?.status || 500).send(message);
  }
});

module.exports = router;
