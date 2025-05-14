import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Contest } from "./Contest";
import { User } from "./User";


@Entity({ name: "participation" })
export class Participation {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    contestId: number;

    @ManyToOne(() => User, (user) => user.participations)
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(() => Contest, (contest) => contest.participations)
    @JoinColumn({ name: "contestId" })
    contest: Contest;

    @Column("int")
    penalty: number;

    @Column("int")
    position: number; // position in the leaderboard

    @Column("int")
    problemsSolved: number;

    @Column("int")
    numAttempts: number;

    @Column("float")
    percentile: number;
}