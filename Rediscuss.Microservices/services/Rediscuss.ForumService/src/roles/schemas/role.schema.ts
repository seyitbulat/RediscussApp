import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Permission } from "../../permissions/schemas/permission.schema";

export type RoleDocument = HydratedDocument<Role>;

@Schema({ versionKey: false })
export class Role {
    @Prop()
    _id: string;

    @Prop()
    RoleName: string;

    @Prop()
    Description: string;

    @Prop()
    Scope: string;

    @Prop()
    CreatedAt: [Date];
    @Prop()
    UpdatedAt: [Date];
    @Prop()
    DeletedAt: [Date];

    @Prop()
    CreatedBy: [number];
    @Prop()
    UpdatedBy: [number];
    @Prop()
    DeletedBy: [number];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }], default: [] })
    Permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);