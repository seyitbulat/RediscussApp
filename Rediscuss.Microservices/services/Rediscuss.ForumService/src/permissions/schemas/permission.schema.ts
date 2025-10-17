import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ versionKey: false })
export class Permission{
    @Prop({type: String, unique: true})
    ActionName: string;

    @Prop({type: String, required: false})
    Description: string;
    
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);