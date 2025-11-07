
export class CreateCommentDto{
    parentCommentId?:string;
    postId: string;
    content: string;
}