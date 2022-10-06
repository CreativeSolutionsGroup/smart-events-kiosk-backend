import { createClient } from "redis";

export const initialize_client = async () => {
    const client = createClient({
        url: `redis://:${process.env.REDIS_PASSWORD ?? ""}@${process.env.REDIS_URL ?? "localhost"}:6379`
    });
    await client.connect();

    return client;
}