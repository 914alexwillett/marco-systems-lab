import { Router } from "express";
import { runConditionalMeanTest } from "../analytics/hypothesis";
import { runKMeans } from "../analytics/kmeans";
import { loadMacroData } from "../data/macroService";
import { MacroVariable } from "../types/macro";

const macroRouter = Router();

macroRouter.get("/macro", async (_req, res, next) => {
  try {
    const data = await loadMacroData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

macroRouter.get("/regimes", async (req, res, next) => {
  try {
    const k = Number(req.query.k ?? 3);
    const data = await loadMacroData();
    const result = runKMeans(data, k);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

macroRouter.get("/hypothesis", async (req, res, next) => {
  try {
    const variable = (req.query.variable as MacroVariable) ?? "cpi_yoy";
    const threshold = Number(req.query.threshold ?? 0);
    const operator = (req.query.operator as ">" | "<" | ">=" | "<=") ?? ">";

    const allowedVariables: MacroVariable[] = ["cpi_yoy", "yield_10y", "spx_return"];
    const allowedOperators = [">", "<", ">=", "<="];

    if (!allowedVariables.includes(variable)) {
      res.status(400).json({ error: "Invalid variable" });
      return;
    }

    if (!allowedOperators.includes(operator)) {
      res.status(400).json({ error: "Invalid operator" });
      return;
    }

    if (Number.isNaN(threshold)) {
      res.status(400).json({ error: "Threshold must be numeric" });
      return;
    }

    const data = await loadMacroData();
    const result = runConditionalMeanTest(data, variable, threshold, operator);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default macroRouter;
