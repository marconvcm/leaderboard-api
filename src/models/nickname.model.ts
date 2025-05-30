import { Schema, model, Document } from "mongoose";

type NicknameEntry = {
   UID: string;
   hash: string;
   nickname: string;
}

export const NicknameEntrySchema = new Schema<NicknameEntry>({
   UID: {
      type: String,
      required: true,
      unique: true,
      validate: {
         validator: (value: string) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
         message: (props: any) => `${props.value} is not a valid UUIDv4`
      }
   },
   hash: {
      type: String,
      required: true,
      unique: true,
      validate: {
         validator: (value: string) => /^\d{6}$/.test(value),
         message: (props: any) => `${props.value} is not a valid 6-digit number`
      }
   },
   nickname: {
      type: String,
      required: true,
      validate: {
         validator: (value: string) => /^[A-Za-z0-9_-]{4,10}$/.test(value),
         message: (props: any) => `${props.value} must be 4 to 10 characters and only contain letters, numbers, _ or -`
      }
   },
}, {
   _id: true,
   timestamps: true,
});

export default model<NicknameEntry>("NicknameEntry", NicknameEntrySchema);