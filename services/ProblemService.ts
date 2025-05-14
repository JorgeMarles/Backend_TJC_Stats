import { SubmissionRepository } from "../repositories/SubmissionRepository";
import { TopicRepository } from "../repositories/TopicRepository";

type VeredictInfo = {
    name: string;
    total: number;
}

type TopicInfo = {
    id: number;
    name: string;
    total: number;
}

type ProblemStats = {
    vereditcs: VeredictInfo[];
    topics: TopicInfo[];
    total_problems: number;
    total_solved: number;
    average_attempts: number;
}

const VEREDICTS = [
    "Accepted",
    "Wrong Answer",
    "Time Limit Exceeded",
    "Memory Limit Exceeded",
    "Compilation Error"
]

export const getProblemStats = async (userId: number): Promise<ProblemStats> => {
    const submissions = await SubmissionRepository.find({
        where: {
            user: {
                id: userId
            }
        },
        relations: {
            user: true,
            problem: {
                topic: true
            }
        }
    })

    const totalProblems = submissions.length;

    const averageAttempts = submissions.length / totalProblems;

    const veredictCounts: Record<string, number> = {};

    for (const veredict of VEREDICTS) {
        veredictCounts[veredict] = 0;
    }

    const topicCounts: Record<number, number> = {};

    const topicsId: Record<number, string> = {};

    const topics = await TopicRepository.find();

    for (const topic of topics) {
        topicsId[topic.id] = topic.name;
    }

    for (const submission of submissions) {
        veredictCounts[submission.veredict] = (veredictCounts[submission.veredict] || 0) + 1;
        if (submission.veredict === "Accepted")
            topicCounts[submission.problem.topic.id] = (topicCounts[submission.problem.topic.id] || 0) + 1;
    }

    const veredictInfo = Object.entries(veredictCounts).map(([name, total]) => ({ name, total }));

    const topicInfo = Object.entries(topicCounts).map(([id, total]) => ({
        id: parseInt(id),
        name: topicsId[parseInt(id)],
        total
    }));

    return {
        vereditcs: veredictInfo,
        topics: topicInfo,
        total_problems: totalProblems,
        total_solved: veredictCounts["Accepted"],
        average_attempts: averageAttempts
    };
}