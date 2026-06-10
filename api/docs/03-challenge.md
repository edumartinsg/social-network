# Challenge 3 — CreateUserUseCase
Build the first use case.

Lives in application/user/use-cases/create-user.ts
Receives { name?, age, email, username, password }
Validates format first — before any DB calls
Checks email uniqueness via IUserRepository.findByEmail()
Checks username uniqueness via IUserRepository.findByUsername()
Hashes password via IEncryptor
Creates User entity
Saves via IUserRepository.save()
Returns Result<User>
Tests: success, invalid email, weak password, age below 18, email taken, username taken, password hashed, save not called on failure