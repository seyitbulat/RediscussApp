import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Permission } from "../../permissions/schemas/permission.schema";
import { string } from "zod";

export type RoleDocument = HydratedDocument<Role>;

@Schema({ versionKey: false })
export class Role {
    @Prop({ type: String, unique: true })
    RoleName: string;

    @Prop({ type: String, required: false })
    Description: string;

    @Prop({ type: String, required: false })
    Scope: string;

    @Prop({ type: Date, required: false })
    CreatedAt: Date;
    @Prop({ type: Date, required: false, default: null })
    UpdatedAt: Date;
    @Prop({ type: Date, required: false, default: null })
    DeletedAt: Date;

    @Prop({ type: string, required: false, default: null })
    CreatedBy: string;
    @Prop({ type: string, required: false, default: null })
    UpdatedBy: string;
    @Prop({ type: string, required: false, default: null })
    DeletedBy: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }], default: [] })
    Permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);