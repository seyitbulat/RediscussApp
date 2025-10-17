import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";



@Schema({
    versionKey: false
})
export class Follow {

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Discuit' })
    discuit: string;

    @Prop({ required: true, type: MongooseSchema.Types.Mixed, ref: 'User' })
    user: string;


    // Dates
    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

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
    deletedBy?: string;


    // Flags
    @Prop({ type: Boolean, default: false })
    isDeleted?: boolean;
}

export type FollowDocument = HydratedDocument<Follow>;
export const FollowSchema = SchemaFactory.createForClass(Follow);