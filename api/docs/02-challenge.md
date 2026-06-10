# Challenge 2 — User Domain
Build the User domain.

Email Value Object — validates format, stores lowercase
Password Value Object — min 8 chars, uppercase, number, special char. Methods: toHash(encryptor), compare(plain, encryptor)
UserId Value Object — wraps a UUID
Age Value Object — must be 18 or older
UserName Value Object — min 2 chars, no spaces
User Entity with: id, email, password, username, age, name?, createdAt, updatedAt, deletedAt
updateEmail(), updatePassword(), delete() methods
IUserRepository interface with: findById, findByEmail, findByUsername, save, delete
IEncryptor interface in domain/shared/interfaces/
BcryptEncryptor implementing IEncryptor in infrastructure/services/
Tests: each Value Object, User entity, BcryptEncryptor