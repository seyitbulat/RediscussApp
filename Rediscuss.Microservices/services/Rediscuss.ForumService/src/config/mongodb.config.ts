import { registerAs } from "@nestjs/config";



export default registerAs('mongodb', () => ({
    url: process.env.MONGODB_URI || 'mongodb://root:String.123!@localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'RediscussForumDB',
}));