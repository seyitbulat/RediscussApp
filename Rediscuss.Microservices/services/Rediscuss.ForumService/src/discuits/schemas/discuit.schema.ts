import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type DiscuitDocument = HydratedDocument<Discuit>;

@Schema({ 
  versionKey: false,
  timestamps: { createdAt: 'createdAt' }
})
export class Discuit {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;
  


  // Dates
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date , default: null })
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


export const DiscuitSchema = SchemaFactory.createForClass(Discuit);

