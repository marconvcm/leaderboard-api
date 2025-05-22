import { Schema, model, Document } from "mongoose";

interface IUserScoreEntry {
   score: number;
   timestamp: Date;
}

interface IUserScore {
   topScore: number;
   entries: IUserScoreEntry[];
}

export interface IScoreSegment extends Document {
   apiKey: string;
   users: Map<string, IUserScore>;
}

const UserScoreEntrySchema = new Schema<IUserScoreEntry>({
   score: { type: Number, required: true },
   timestamp: { type: Date, required: true },
}, { _id: false });

const UserScoreSchema = new Schema<IUserScore>({
   topScore: { type: Number, required: true },
   entries: { type: [UserScoreEntrySchema], required: true },
}, { _id: false });

const ScoreSegmentSchema = new Schema<IScoreSegment>({
   apiKey: { type: String, required: true, unique: true },
   users: { type: Map, of: UserScoreSchema, default: {} }
});

export default model<IScoreSegment>("ScoreSegment", ScoreSegmentSchema);
