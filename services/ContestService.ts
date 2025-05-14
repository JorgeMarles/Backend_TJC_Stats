import { ContestRepository } from "../repositories/ContestRepository";
import { ParticipationRepository } from "../repositories/ParticipationRepository";
import { UserRepository } from "../repositories/UserRepository";

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


export const createContest = async (id: number, difficulty: number, numProblems: number, end: Date) => {

    console.log(`Creating contest with id ${id}, difficulty ${difficulty}, numProblems ${numProblems}, end ${end}`);

    const contest = await ContestRepository.create({
        id,
        difficulty,
        numProblems,
        end,
    });

    await ContestRepository.save(contest);
}

export const createParticipation = async (contestId: number, userId: number, position: number, problemsSolved: number, numAttempts: number, penalty: number, percentile: number) => {
    console.log(`Creating participation with contestId ${contestId}, userId ${userId}, position ${position}, problemsSolved ${problemsSolved}, numAttempts ${numAttempts}, penalty ${penalty}, percentile ${percentile}`);
    const contest = await ContestRepository.findOne({ where: { id: contestId } });
    if (!contest) {
        throw new Error(`Contest with id ${contestId} not found`);
    }
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new Error(`User with id ${userId} not found`);
    }

    const participation = await ParticipationRepository.create({
        contestId: contest.id,
        userId: user.id,
        contest,
        user,
        position,
        problemsSolved,
        numAttempts,
        penalty,
        percentile
    });
    await ParticipationRepository.save(participation);
}