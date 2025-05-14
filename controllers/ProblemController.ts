import { Request, Response } from "express";
import { getProblemStats } from "../services/ProblemService";

export const getProblems = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userIdInt = parseInt(id);
    if (isNaN(userIdInt)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {
        const problems = await getProblemStats(userIdInt);
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}