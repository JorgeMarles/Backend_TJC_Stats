import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import "reflect-metadata";
import { PORT, URL_FRONTEND } from './config';

const app = express();

app.use(cors({
    origin: URL_FRONTEND
}));

app.use(bodyParser.json());


const run = async () => {
    try {
        //await AppDataSource.initialize();
    }
    catch (e: unknown) {
        if (e instanceof Error) {
            console.log(e.message);
        }
        else console.log("Error during Data Source initialization");
    }

    try {
        //await connectRabbitMQ();
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        else console.error("Error connecting to RabbitMQ");
    }
    app.listen(PORT, () => console.log(`Listening in port ${PORT}`));
};

run();