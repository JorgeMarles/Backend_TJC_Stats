import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Topic } from "./Topic";
import { Submission } from "./Submission";

@Entity({ name: "problem" })
export class Problem {
    @PrimaryColumn()
    id: number;

    @Column("varchar", { length: 200 })
    difficulty: string;

    @ManyToOne(() => Topic, (topic) => topic.problems)
    topic: Topic

    @OneToMany(() => Submission, submission => submission.problem)
    submissions: Submission[];
}