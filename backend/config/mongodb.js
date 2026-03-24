import mongoose from 'mongoose';

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
     console.log('DB Connected');
  });
  
  mongoose.connection.on('error', (err) => {
    console.log('DB Error:', err);
  });

  await mongoose.connect(`${process.env.MONGODB_URI}/masslabs`);
};

export default connectDB;