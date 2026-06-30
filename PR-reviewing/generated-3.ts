type User = {
  id: string
  email: string
  failedLoginAttempts: number
  accountLockedUntil?: Date
}

type UserRepository = {
  findByEmail(email: string): Promise<User | null>
  update(user: User): Promise<void>
}

type PasswordHasher = {
  compare(password: string, hash: string): Promise<boolean>
}

type PasswordRepository = {
  getPasswordHash(userId: string): Promise<string>
}

type SessionRepository = {
  create(userId: string): Promise<string>
}

type LoginInput = {
  email: string
  password: string
}

export async function login(
  input: LoginInput,
  users: UserRepository,
  passwords: PasswordRepository,
  hasher: PasswordHasher,
  sessions: SessionRepository,
) {
  const user = await users.findByEmail(input.email)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  if (
    user.accountLockedUntil &&
    user.accountLockedUntil > new Date()
  ) {
    throw new Error("Account locked")
  }

  const hash = await passwords.getPasswordHash(user.id)

  const matches = await hasher.compare(
    input.password,
    hash,
  )

  if (!matches) {
    user.failedLoginAttempts++

    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(
        Date.now() + 15 * 60 * 1000,
      )
    }

    await users.update(user)

    throw new Error("Invalid credentials")
  }

  user.failedLoginAttempts = 0

  const sessionId = await sessions.create(user.id) 

  await users.update(user)

  return {
    sessionId,
    userId: user.id,
  }
}