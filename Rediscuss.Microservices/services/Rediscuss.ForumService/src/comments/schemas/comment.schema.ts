import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
    postId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment', default: null })
    parentCommentId?: string;

    // Dates
    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: null })
    updatedAt?: Date | null;

    @Prop({ type: Date, default: null })
    deletedAt?: Date | null;

    // User References
    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'User', default: null })
    createdBy?: any;

    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'User', default: null })
    updatedBy?: any;

    @Prop({ type: MongooseSchema.Types.Mixed, default: null })
    deletedBy?: any;

    // Flags
    @Prop({ type: Boolean, default: false })
    isDeleted?: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);