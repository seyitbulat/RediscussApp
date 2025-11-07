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
    createdBy?: string

    createdByUsername?: string

    followersCount?: number,
    isFollowedByCurrentUser?: boolean
}


export interface PostDto{
    id: string,
    title: string,
    content: string,
    discuit: DiscuitDto,
    upChips: number,
    downChips: number,
    totalChips?: number,
    chipByUser?: number,
    createdBy: string,
    createdAt: Date,
    createdByUsername: string,
    discuitName: string,
    hotScore?: number,
    commentCount?: number
    comments?: CommentDto[]
}



export interface Vote{
    upVotes: number,
    downVotes: number
}



export interface FollowDto{
    id: string,
    userId: string,
    discuit: DiscuitDto,
    createdAt: Date
}


export interface CommentDto {
    id: string;
    postId: string;
    content: string;
    createdBy: string;
    createdByUsername: string;
    createdAt: Date;
    parentCommentId?: string | null;
}