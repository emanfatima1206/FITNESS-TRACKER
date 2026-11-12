import express from "express";
import { getDashboardData, getReportsAnalytics } from "../Controller/reportcontroller.js";
import authMiddleware from "../Middleware/authmiddleware.js";

const reportroute = express.Router();

reportroute.use(authMiddleware);

reportroute.get("/dashboard", getDashboardData);
reportroute.get("/analytics", getReportsAnalytics);
reportroute.get("/summary", getReportsAnalytics);

export default reportroute;
