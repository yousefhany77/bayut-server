import { AxiosError } from "axios";
import express from "express";
import { Request, Response } from "express";
import { bayutFetch } from "./../lib/fetch";

import { redisClient as client } from "./../app";
const router = express.Router();

const defaultParams = {
  locationExternalIDs: "5002,6020",
  purpose: "for-rent",
  hitsPerPage: "25",
  page: "0",
  lang: "en",
  sort: "city-level-score",
  rentFrequency: "monthly",
  categoryExternalID: "4",
};
router.get("/list", async (req: Request, res: Response) => {
  console.log(
    `================================================================`
  );

  try {
    const query = JSON.stringify(req.query);
    // check if query is in cache
    const cachedQuery = await client.get(`${query}-property-list`);
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
    const { data } = await bayutFetch.get(`/properties/list`, {
      params: req.query.locationExternalIDs ? req.query : defaultParams,
    });
    if (data.nbHits !== 0) {
      await client.setex(`${query}-property-list`, 3600, JSON.stringify(data));
    }
    console.log(
      `[${req.method}]: ${req.url} ${new Date().toLocaleTimeString("en-us", {
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
router.get("/details/", async (req: Request, res: Response) => {
  console.log(
    `================================================================`
  );

  const { externalID } = req.query;
  // check if query is in cache first
  const cachedQuery = await client.get(`property-${externalID}`);
  if (cachedQuery) {
    console.log(
      `[${req.method}][🚀cached]: ${req.url} ${new Date().toLocaleTimeString(
        "en-us",
        {
          timeStyle: "medium",
        }
      )}`
    );
    return res.json(JSON.parse(cachedQuery));
  }
  try {
    const { data } = await bayutFetch.get(`/properties/detail`, {
      params: { externalID },
    });
    if (typeof data === "string") {
      return res.status(404).send("No properties found with that ID.");
    } else {
      await client.setex(`property-${externalID}`, 3600, JSON.stringify(data));
      console.log(
        `[${req.method}][🌏API]: ${req.url} ${new Date().toLocaleTimeString(
          "en-us",
          {
            timeStyle: "medium",
          }
        )}`
      );
      return res.json(data);
    }
  } catch (err: unknown) {
    const error = err as AxiosError;
    const { message } = error.response?.data as { message: string };
    return res.status(error.response?.status || 500).send(message);
  }
});

module.exports = router;
