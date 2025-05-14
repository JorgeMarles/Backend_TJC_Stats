import { ContestRepository } from "../repositories/ContestRepository";
import { ParticipationRepository } from "../repositories/ParticipationRepository";

type ContestItem = {
    id: number;
    position: number;
    percentie: number;
}

type ContestStats = {
    total_contests: number;
    ranking: ContestItem[];
}

export const getContestStats = async (userId: number): Promise<ContestStats> => {
    const contests = await ParticipationRepository.find({
        where: {
            user: {
                id: userId
            }
        },
        relations: {
            user: true,
            contest: true
        }
    })
    const totalContests = contests.length;
    const ranking = contests.map((participation) => ({
        id: participation.contest.id,
        position: participation.position,
        percentie: participation.percentile
    }));

    return {
        total_contests: totalContests,
        ranking
    };
}
