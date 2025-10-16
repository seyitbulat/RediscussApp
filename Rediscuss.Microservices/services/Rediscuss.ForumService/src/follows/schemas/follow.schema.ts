import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";



@Schema({
    versionKey: false,
    timestamps: { createdAt: 'createdAt' }
})
export class Follow {

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Discuit' })
    discuitId: string;

    @Prop({ required: true, type: MongooseSchema.Types.Mixed, ref: 'User' })
    userId: number;



    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'User' })
    createdBy?: number;

    @Prop({ type: Date })
    updatedAt?: Date;

    @Prop({ type: MongooseSchema.Types.Mixed, ref: 'User' })
    updatedBy?: number;

    @Prop({ type: Date })
    deletedAt?: Date;

    @Prop({ type: Number })
    deletedBy?: number;

    @Prop({ type: Boolean, default: false })
    isDeleted?: boolean;
}

export type FollowDocument = HydratedDocument<Follow>;
export const FollowSchema = SchemaFactory.createForClass(Follow);