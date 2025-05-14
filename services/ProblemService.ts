import { ProblemRepository } from "../repositories/ProblemRepository";
import { SubmissionRepository } from "../repositories/SubmissionRepository";
import { TopicRepository } from "../repositories/TopicRepository";
import { UserRepository } from "../repositories/UserRepository";

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
        },
        select: {
            // Especificar exactamente qué campos necesitas
            id: true,
            veredict: true,
            user: {
                id: true
            },
            problem: {
                id: true,
                topic: {
                    id: true,
                    name: true
                }
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
        average_attempts: (!isNaN(averageAttempts) && isFinite(averageAttempts)) ? averageAttempts : 0
    };
}

export const createProblem = async (id: number, difficulty: string, topicId: number) => {
    console.log(`Creating problem with id ${id}, difficulty ${difficulty}, topicId ${topicId}`);
    const topic = await TopicRepository.findOne({ where: { id: topicId } });
    if (!topic) {
        throw new Error(`Topic with id ${topicId} not found`);
    }

    const problem = await ProblemRepository.create({
        id,
        difficulty,
        topic
    });
    await ProblemRepository.save(problem);
}

export const createTopic = async (id: number, name: string) => {
    console.log(`Creating topic with id ${id}, name ${name}`);
    const topic = await TopicRepository.create({
        id,
        name
    });
    await TopicRepository.save(topic);
}

export const createSubmission = async (id: string, userId: number, problemId: number, veredict: string, time: Date) => {
    console.log(`Creating submission with id ${id}, userId ${userId}, problemId ${problemId}, veredict ${veredict}, time ${time}`);
    const problem = await ProblemRepository.findOne({ where: { id: problemId } });
    if (!problem) {
        throw new Error(`Problem with id ${problemId} not found`);
    }
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new Error(`User with id ${userId} not found`);
    }

    const submission = await SubmissionRepository.create({
        id,
        user,
        problem,
        veredict,
        time
    });
    await SubmissionRepository.save(submission);
}