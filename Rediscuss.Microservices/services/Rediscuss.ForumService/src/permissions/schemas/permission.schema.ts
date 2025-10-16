import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ versionKey: false })
export class Permission{
    @Prop()
    _id: string;
    
    @Prop()
    ActionName: string;

    @Prop()
    Description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);