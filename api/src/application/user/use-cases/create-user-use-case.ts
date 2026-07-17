import { Result } from "@/domain/shared/result";
import { User } from "@/domain/user/entities/user";
import { Email } from "@/domain/user/value-objects/email";
import { UserId } from "@/domain/user/value-objects/userId";
import { Password } from "@/domain/user/value-objects/password";
import {Age} from "@/domain/user/value-objects/age";
import { IUserRepository } from "@/domain/user/repositories/UserRepository";
import { IEncryptor } from "@/domain/shared/interfaces/Encryptor";
import { UserName } from "@/domain/user/value-objects/username";


interface CreateUserUseCaseRequest {
    name?: string;
    age: number;
    email: string;
    username: string;
    password: string;
}

type CreateUserUseCaseResponse = Result <User>;


export class CreateUserUseCase {
    constructor(private userRepository : IUserRepository,
        private encryptor: IEncryptor

    ) {}

    async execute({name, age, email, password, username}: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {

        // ✅ correct order
        // 1. validate format first — no DB calls yet
        const emailOrError = Email.create(email)
        if (emailOrError.isFailure) return Result.fail(emailOrError.error)
        
        const passwordOrError = Password.create(password)
        if (passwordOrError.isFailure) return Result.fail(passwordOrError.error)
        
        const ageOrError = Age.create(age)
        if (ageOrError.isFailure) return Result.fail(ageOrError.error)
        
        const usernameOrError = UserName.create(username)
        if (usernameOrError.isFailure) return Result.fail(usernameOrError.error)
        
        const idOrError = UserId.create()
        if (idOrError.isFailure) return Result.fail(idOrError.error)
        
        // 2. only hit DB after validation passes
        const existingEmail = await this.userRepository.findByEmail(email)
        if (existingEmail) return Result.fail('Email already in use')
        
        const existingUsername = await this.userRepository.findByUsername(username)
        if (existingUsername) return Result.fail('Username already in use')

  

        // 3. hash password
        const hashedPassword = await passwordOrError.value.hash(this.encryptor)

        // 4. create user entity
        const userOrError = User.create({
            name,
            id: idOrError.value,
            username: usernameOrError.value, // generate username from email
            email: emailOrError.value,
            age: ageOrError.value,
            password: hashedPassword,
        })

        if (userOrError.isFailure) return Result.fail(userOrError.error)

        // 5. persist
        await this.userRepository.save(userOrError.value)

  return Result.ok(userOrError.value)
    }
}
