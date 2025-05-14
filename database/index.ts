import mysql from "mysql2";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../config";
import { DataSource } from 'typeorm';
import { User } from "./entity/User";
import { Problem } from "./entity/Problem";
import { Topic } from "./entity/Topic";
import { Submission } from "./entity/Submission";
import { Contest } from "./entity/Contest";
import { Participation } from "./entity/Participation";


export const AppDataSource = new DataSource({
  type: 'mysql', 
  host: DB_HOST,
  driver: mysql,
  port: parseInt(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  entities: [User, Topic, Problem, Submission, Contest, Participation]
});