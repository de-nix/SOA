class AuthService {
  static getUsername(): string {
    return localStorage.getItem('username') ?? '';
  }

  static getJwt(): string {
    return localStorage.getItem('jwt') ?? '';
  }

  static setLoggedUser(username: string, jwt: string) {
    localStorage.setItem('username', username);
    localStorage.setItem('jwt', jwt);
  }
}

export default AuthService;