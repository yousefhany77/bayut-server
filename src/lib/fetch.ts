import Axios from "axios";

export const bayutFetch = Axios.create({
  baseURL: "https://bayut.p.rapidapi.com",
  headers: {
    "X-RapidAPI-Key": process.env.API_KEY,
    "X-RapidAPI-Host": "bayut.p.rapidapi.com",
    "Cache-Control":
      "public, s-maxage=604800,maxage=604800 , stale-while-revalidate=172800",
  },
});
