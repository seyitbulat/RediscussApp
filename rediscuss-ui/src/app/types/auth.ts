export interface UserLoginCredentials{
    username: string;
    password: string;
}


export interface AuthTokenResponse{
    token: string;
}

export interface UserProfile{
    userId: number;
    username: string;
    email: string;
    createdAt: string;
}