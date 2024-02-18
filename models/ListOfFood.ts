import mongoose, { Schema, Document } from 'mongoose';

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ListOfFood extends Document {
  _id?: string;
  itemName: string;
  description: string;
  vegetarian: boolean;
  nutrition: Nutrition;
  ingredients: string[];
  photoUrl: string;
  foodType: 'fruit' | 'vegetable' | 'meat' | 'grain' | 'dairy';
  createdAt: Date;
}

const NutritionSchema = new Schema<Nutrition>({
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

const ListOfFoodSchema = new Schema<ListOfFood>({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  vegetarian: { type: Boolean, required: true },
  nutrition: { type: NutritionSchema, required: true },
  ingredients: { type: [String], required: true },
  photoUrl: { type: String, required: true },
  foodType: { type: String, enum: ['fruit', 'vegetable', 'meat', 'grain', 'dairy'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Food = mongoose.model<ListOfFood>('Food', ListOfFoodSchema);