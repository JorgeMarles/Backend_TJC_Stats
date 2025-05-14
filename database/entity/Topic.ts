import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Problem } from "./Problem";

@Entity({ name: "topic" })
export class Topic {
    @PrimaryColumn()
    id: number;

    @Column("varchar", { length: 200 })
    name: string;
    
    @OneToMany(() => Problem, (problem) => problem.topic)
    problems: Problem[]
}