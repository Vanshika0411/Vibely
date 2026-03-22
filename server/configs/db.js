import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database connected'));
        // Connect to the Vibely database
        await mongoose.connect(`${process.env.MONGODB_URL}/vibelyDB?retryWrites=true&w=majority`);
    } catch (error) {
        console.log(error.message);
    }
};

export default connectDB;