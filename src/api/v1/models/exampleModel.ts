import mongoose from 'mongoose';

export interface Example {
  message: string;
}

export const exampleSchema = new mongoose.Schema<Example>({
  message: {
    type: String,
    required: true,
  },
});

export const ExampleModel = mongoose.model<Example>('Example', exampleSchema);

export const exampleData: Example = {
  message: 'Express and TypeScript are working.',
};
