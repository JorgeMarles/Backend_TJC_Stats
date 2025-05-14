import { AppDataSource } from "../database";
import { Topic } from "../database/entity/Topic";

export const TopicRepository = AppDataSource.getRepository(Topic)