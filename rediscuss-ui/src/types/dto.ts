export interface TokenDto{
    token: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

export interface UserDto{
    userId: string;
    username: string,
    email: string,
    createdAt: Date
}

export interface DiscuitDto{
    id: string,
    name?: string,
    description?: string,
    createdAt?: Date,
    createdBy?: number

    createdByUsername?: string
}


export interface PostDto{
    id: string,
    title: string,
    content: string,
    discuitId: string,
    upVotes: number,
    downVotes: number,
    createdBy: number,
    createdAt: Date,
    createdByUserName: string,
    discuitName: string
}



export interface Vote{
    upVotes: number,
    downVotes: number
}