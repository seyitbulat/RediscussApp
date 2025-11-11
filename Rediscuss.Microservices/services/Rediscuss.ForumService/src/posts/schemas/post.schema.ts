import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";


@Schema({ versionKey: false, timestamps: true })
export class Post {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Discuit' })
    discuit: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Topic' }], default: [] })
    topics: string[];


    // Dates
    @Prop({ type: Date, default: Date.now, required: true })
    createdAt: Date;

    @Prop({ type: Date, default: null })
    updatedAt?: string;

    @Prop({ type: Date, default: null })
    deletedAt?: Date;


    // User References
    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'User' })
    createdBy?: string;

    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'User' })
    updatedBy?: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    deletedBy?: number;


    // Flags
    @Prop({ type: Boolean, default: false })
    isDeleted?: boolean;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);