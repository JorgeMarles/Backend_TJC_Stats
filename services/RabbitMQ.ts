import ampq from 'amqplib';
import { RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_USERNAME } from '../config';
import { createContest, createParticipation } from './ContestService';
import { createProblem, createSubmission, createTopic } from './ProblemService';
import { createUser } from './UserService';


type ContestData = {
    contestId: number;
    endTime: Date;
    numProblems: number;
    difficulty: number;
}

type ParticipationData = {
    contestId: number;
    userId: number;
    position: number;
    problemsSolved: number;
    numAttempts: number;
    penalty: number;
    percentile: number;
}

type TopicData = {
    topicId: number;
    topicName: string;
}

type ProblemData = {
    problemId: number;
    problemName: string;
    topicId: number;
    difficulty: string;
}

type UserData = {
    userId: number;
}

type SubmissionData = {
    submissionId: string;
    userId: number;
    problemId: number;
    veredict: string;
    submissionTime: Date;
}

type ContestMessage = {
    type: "contest";
    data: ContestData;
}

type ParticipationMessage = {
    type: "participation";
    data: ParticipationData;
}

type TopicMessage = {
    type: "topic";
    data: TopicData;
}

type ProblemMessage = {
    type: "problem";
    data: ProblemData;
}

type UserMessage = {
    type: "user";
    data: UserData
}

type SubmissionMessage = {
    type: "submission";
    data: SubmissionData;
}

type Message = ContestMessage | ParticipationMessage | TopicMessage | ProblemMessage | UserMessage | SubmissionMessage;

type QueueInfo = {
    type: string,
    exchange: string,
    arguments: {
        [key: string]: any
    }
}

type QueueOutData = {
    info?: QueueInfo,
    queue: ampq.Replies.AssertQueue | null,
}

type QueueInData = {
    info?: QueueInfo,
    queue: ampq.Replies.AssertQueue | null,
    consume: (channel: ampq.Channel, msg: ampq.ConsumeMessage | null) => Promise<any>
}

type RabbitMQUtils = {
    queuesOut?: {
        [key: string]: QueueOutData
    },
    queuesIn?: {
        [key: string]: QueueInData
    }
    channel: ampq.Channel | null
}

const rmq: RabbitMQUtils = {
    queuesIn: {
        'contest-stats': {
            queue: null,
            consume: async (channel: ampq.Channel, msg: ampq.ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const data: Message = JSON.parse(msg.content.toString());
                    console.log("RECEIVED MESSAGE", data)
                    if(data.type === 'contest'){
                        const contest = data.data as ContestData;
                        const { contestId, endTime, numProblems, difficulty } = contest;
                        await createContest(contestId, difficulty, numProblems, endTime);
                    }else if(data.type === 'participation'){
                        const participation = data.data as ParticipationData;
                        const { contestId, userId, position, problemsSolved, numAttempts, penalty, percentile } = participation;
                        await createParticipation(contestId, userId, position, problemsSolved, numAttempts, penalty, percentile);
                    }
                    
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing contest-stats message:', error);
                    channel.nack(msg, false, false);
                }
            }
        },
        'problem-stats': {
            queue: null,
            consume: async (channel: ampq.Channel, msg: ampq.ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const data: Message = JSON.parse(msg.content.toString());
                    if(data.type === 'problem'){
                        const problem = data.data as ProblemData;
                        const { problemId, problemName, topicId, difficulty } = problem;
                        await createProblem(problemId, difficulty, topicId);
                    } else if(data.type === 'topic'){
                        const topic = data.data as TopicData;
                        const { topicId, topicName } = topic;
                        await createTopic(topicId, topicName);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing problem-stats message:', error);
                    channel.nack(msg, false, false);
                }
            }
        },
        'user-stats': {
            queue: null,
            consume: async (channel: ampq.Channel, msg: ampq.ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const data: Message = JSON.parse(msg.content.toString());
                    if(data.type === 'user'){
                        const user = data.data as UserData;
                        const { userId } = user;
                        createUser(userId);
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing contest-stats message:', error);
                    channel.nack(msg, false, false);
                }
            }
        },
        'submission-stats': {
            queue: null,
            consume: async (channel: ampq.Channel, msg: ampq.ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const data: Message = JSON.parse(msg.content.toString());
                    if(data.type === 'submission'){
                        const submission = data.data as SubmissionData;
                        const { submissionId, userId, problemId, veredict, submissionTime } = submission;
                        
                        await createSubmission(submissionId, userId, problemId, veredict, submissionTime)
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing contest-stats message:', error);
                    channel.nack(msg, false, false);
                }
            }
        },
    },
    channel: null
}

export const connectRabbitMQ = async () => {
    try {
        console.log('Connecting to RabbitMQ at', getRabbitMQURL(), '...');

        const connection = await ampq.connect(getRabbitMQURL());
        const channel = await connection.createChannel();

        for (const key in rmq.queuesOut) {
            const queue = key;
            rmq.queuesOut[key].queue = await channel.assertQueue(queue, { durable: true });
            if (rmq.queuesOut[key].info) {
                const { type, exchange } = rmq.queuesOut[key].info;
                await channel.assertExchange(exchange, type, { durable: true, arguments: rmq.queuesOut[key].info.arguments });
                await channel.bindQueue(queue, exchange, key);
            }
            console.log(`Queue ${queue} is ready`);
        }

        for (const key in rmq.queuesIn) {
            const queue = key;
            rmq.queuesIn[key].queue = await channel.assertQueue(queue, { durable: true });
            channel.consume(queue, async (msg) => rmq.queuesIn![key].consume(channel, msg), { noAck: false });
        }

        rmq.channel = channel;

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}


const getRabbitMQURL = () => {
    return `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
}