import { Request, Response } from "express";
import { getContestStats } from "../services/ContestService";


export const getContests = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid contest ID' });
        }
        const info = await getContestStats(id);
        return res.status(200).json(info);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}