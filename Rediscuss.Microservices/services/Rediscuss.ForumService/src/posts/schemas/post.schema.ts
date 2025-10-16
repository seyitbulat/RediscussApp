import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";


@Schema({ versionKey: false, timestamps: true })
export class Post {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: String, ref: 'Discuit' })
    discuitId: string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: String, ref: 'User' })
    createdBy?: string;

    @Prop({ type: Date })
    updatedAt?: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    updatedBy?: MongooseSchema.Types.ObjectId;

    @Prop({ type: Date })
    deletedAt?: Date;

    @Prop({ type: Number })
    deletedBy?: number;

    @Prop({ type: Boolean, default: false })
    isDeleted?: boolean;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);