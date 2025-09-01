export interface TokenDto{
    token: string;
}

export interface UserDto{
    userId: string;
    username: string,
    email: string,
    createdAt: Date
}

export interface SubredisDto{
    id: string,
    name?: string,
    description?: string,
    createdAt?: Date,
    createdBy?: number
}