import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Problem } from "./Problem";
import { User } from "./User";

@Entity({ name: "submission" })
export class Submission {
    @PrimaryColumn("varchar", { length: 256 })
    id: string;

    @Column("varchar", { length: 100 })
    veredict: string;

    @Column("datetime")
    time: Date;

    @ManyToOne(() => Problem, (problem) => problem.submissions)
    problem: Problem

    @ManyToOne(() => User, (user) => user.submissions)
    user: User
}