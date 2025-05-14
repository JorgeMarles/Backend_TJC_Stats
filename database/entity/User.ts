import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Participation } from "./Participation";
import { Submission } from "./Submission";

@Entity({ name: "user" })
export class User {
    @PrimaryColumn()
    id: number;

    @OneToMany(() => Participation, (participation) => participation.user)
    participations: Participation[];

    @OneToMany(() => Submission, submission => submission.user)
    submissions: Submission[];
}

