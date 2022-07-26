import { Client } from 'pg';

const client = new Client({
  user: process.env.POSTGRESQL_USER,
  host: process.env.POSTGRESQL_HOST,
  database: process.env.POSTGRESQL_DATABASE,
  password: process.env.POSTGRESQL_PASSWORD,
  port: Number(process.env.POSTGRESQL_PORT),
});

client.connect().then(() => {
  console.log('Connected to postgres');
});

export default client;
