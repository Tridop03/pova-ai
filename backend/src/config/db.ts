import { Pool, QueryResult } from 'pg';
import env from './env';

const pool = new Pool({
    connectionString: env.db.connectionString,
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default {
    query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
    getClient: () => pool.connect(),
};
