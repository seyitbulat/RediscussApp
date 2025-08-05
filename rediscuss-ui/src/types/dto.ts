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

    createdByUsername?: string
}


export interface PostDto{
    id: string,
    title: string,
    content: string,
    subredisId: string,
    upVotes: number,
    downVotes: number,
    createdBy: number,
    createdAt: Date,
    createByUserName: string,
    subredisName: string
}