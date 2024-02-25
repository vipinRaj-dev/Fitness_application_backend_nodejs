import mongoose, { Schema, Document } from 'mongoose';

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ListOfFood extends Document {
  _id?: string;
  foodname: string;
  quantity : number;
  unit: string;
  description: string;
  nutrition: Nutrition;
  ingredients: string[];
  photoUrl: string;
  publicId?: string;
  foodtype: string;
  createdAt: Date;
}

const NutritionSchema = new Schema<Nutrition>({
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

const ListOfFoodSchema = new Schema<ListOfFood>({
  foodname: { type: String, required: true },
  quantity : { type: Number, required: true},
  unit: { type: String, required: true },
  description: { type: String, required: true },
  nutrition: { type: NutritionSchema, required: true },
  ingredients: { type: [String], required: true },
  photoUrl: { type: String, required: true },
  publicId: { type: String , required: false},
  foodtype: { type: String,  required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Food = mongoose.model<ListOfFood>('Food', ListOfFoodSchema);