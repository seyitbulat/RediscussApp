import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserRoleDocument = HydratedDocument<UserRole>;

@Schema({ versionKey: false })
export class UserRole {
    @Prop({ type: Number, ref: 'User' })
    UserId: number;

    @Prop({ type: String, ref: 'Role' })
    RoleId: string;


    @Prop({ type: Date })
    CreatedAt: Date;
    @Prop({ type: Date })
    UpdatedAt: Date;
    @Prop({ type: Date })
    DeletedAt: Date;

    @Prop()
    CreatedBy: number;
    @Prop()
    UpdatedBy: number;
    @Prop()
    DeletedBy: number;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);