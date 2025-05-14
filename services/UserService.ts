import { UserRepository } from "../repositories/UserRepository";


export const createUser = async (id: number) => {
    console.log(`Creating user with id ${id}`);
    const user = await UserRepository.create({
        id
    });

    await UserRepository.save(user);
}