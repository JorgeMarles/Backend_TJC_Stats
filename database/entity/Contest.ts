import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Participation } from "./Participation";

@Entity({ name: "contest" })
export class Contest {
    @PrimaryColumn()
    id: number;

    @Column("datetime")
    end: Date;

    @OneToMany(() => Participation, (participation) => participation.contest)
    participations: Participation[];

    @Column("float", { default: 0 })
    difficulty: number;

    @Column("int")
    numProblems: number;
}
