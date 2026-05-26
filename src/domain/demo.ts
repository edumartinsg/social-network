import { Email } from '@/domain/user/value-objects/email';
import { Password } from '@/domain/user/value-objects/password';
import { UserId } from '@/domain/user/value-objects/userId';
import { User } from '@/domain/user/entities/user';

async function main() {
  const emailResult = Email.create('user@example.com');
  const passwordResult = Password.create('Strong123!@#');
  const idResult = UserId.create(); // se vc deixar opcional

  if (emailResult.isFailure || passwordResult.isFailure || idResult.isFailure) {
    console.error('Failed to create value objects', {
      emailError: emailResult.isFailure ? emailResult.error : null,
      passwordError: passwordResult.isFailure ? passwordResult.error : null,
      idError: idResult.isFailure ? idResult.error : null,
    });
    return;
  }

  const userResult = User.create({
    id: idResult.value,
    email: emailResult.value,
    password: passwordResult.value,
  });

  if (userResult.isFailure) {
    console.error('Failed to create user:', userResult.error);
    return;
  }

  const user = userResult.value;
  console.log('User created in domain only:', {
    id: user.id.value,
    email: user.email.,
    createdAt: user.createdAt.toISOString(),
  });
}

main();
