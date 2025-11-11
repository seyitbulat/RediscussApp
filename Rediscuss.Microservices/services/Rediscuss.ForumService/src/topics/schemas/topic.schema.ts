import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";


export type TopicDocument = HydratedDocument<Topic>

@Schema({ versionKey: false })
export class Topic {
    @Prop({ required: true, unique: true })
    name: string


    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ type: [String], default: [] })
    followers: string[];

    @Prop({ type: Number, default: 0 })
    followerCount: number;
}


export const TopicSchema = SchemaFactory.createForClass(Topic); 