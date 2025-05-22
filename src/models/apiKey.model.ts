import { Schema, model, Document } from "mongoose";

export interface IApiKey extends Document {
  key: string;
  secret: string;
  name: string;
  createdAt: Date;
  lastUsed?: Date;
  enabled: boolean;
}

const ApiKeySchema = new Schema<IApiKey>({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  secret: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUsed: { 
    type: Date 
  },
  enabled: { 
    type: Boolean, 
    default: true 
  }
});

export default model<IApiKey>("ApiKey", ApiKeySchema);
