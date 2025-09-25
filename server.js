const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const pg = require('pg');
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lstm499',
  password: '1234',
  port: 5432,
});

const port = 3000;


// get data from join query
app.get('/api/co_urban/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const sql = `SELECT a.id, ST_AsGeoJSON(geom) as geom, b.co
                  FROM public.urban30 AS a
                  JOIN public.co_urban AS b
                    ON a.id::text = b.id
                  WHERE b.date ='${date}'`

    // console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get data from join query
app.get('/api/co_suburban/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, ST_AsGeoJSON(geom) as geom, b.co
                  FROM public.suburban30 AS a
                  JOIN public.co_suburban AS b
                    ON a.id::text = b.id
                  WHERE b.date ='${date}'`

    // console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get data from join query
app.get('/api/co_rural/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, ST_AsGeoJSON(geom) as geom, b.co
                  FROM public.rural30 AS a
                  JOIN public.co_rural AS b
                    ON a.id::text = b.id
                  WHERE b.date ='${date}'`

    // console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// get data from join query
app.get('/api/no2_urban/:date', async (req, res) => {
  try {
    const { date } = req.params;


    const sql = `SELECT a.id, ST_AsGeoJSON(geom) as geom, b.no2
                FROM  public.urban30 AS a
                JOIN  public.no2_urban AS b
                      ON a.id::text = b.id
                WHERE  b.date ='${date}'`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// get data from join query
app.get('/api/no2_suburban/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, ST_AsGeoJSON(geom) as geom, b.no2
                  FROM public.suburban30 AS a
                  JOIN public.no2_suburban AS b
                    ON a.id::text = b.id
                  WHERE b.date ='${date}'`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// get data from join query
app.get('/api/no2_rural/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, ST_AsGeoJSON(geom) as geom, b.no2
                  FROM public.rural30 AS a
                  JOIN public.no2_rural AS b
                    ON a.id::text = b.id
                  WHERE b.date ='${date}'`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// get data from join query forecast co urban
app.get('/api/co_7day_forecast_urban/:date', async (req, res) => {
  try {
    const { date } = req.params;


    const sql = `SELECT a.id, dt, ST_AsGeoJSON(geom) as geom, b.co
                FROM  public.urban30 AS a
                JOIN  public.co_7day_forecast_urban AS b
                      ON a.id::text = b.id
                WHERE  b.dt ='${date}'
`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get data from join query forecast co suburban
app.get('/api/co_7day_forecast_suburban/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const sql = `SELECT a.id, dt, ST_AsGeoJSON(geom) as geom, b.co
                  FROM public.suburban30 AS a
                  JOIN public.co_7day_forecast_suburban AS b
                    ON a.id::text = b.id
                  WHERE b.dt ='${date}'`
    console.log(sql);
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// // get data from join query forecast co rural
app.get('/api/co_7day_forecast_rural/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const sql = `SELECT a.id, dt, ST_AsGeoJSON(geom) as geom, b.co
                  FROM  public.rural30 AS a
                  JOIN public.co_7day_forecast_rural AS b
                    ON a.id::text = b.id
                  WHERE b.dt ='${date}'`
    console.log(sql);
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/// get data from join query forecast no2 urban
app.get('/api/no2_7day_forecast_urban/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, dt, ST_AsGeoJSON(geom) as geom, b.no2
                FROM  public.urban30 AS a
                JOIN  public.no2_7day_forecast_urban AS b
                      ON a.id::text = b.id
                WHERE  b.dt ='${date}'`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/// get data from join query forecast no2 suburban
app.get('/api/no2_7day_forecast_suburban/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, dt, ST_AsGeoJSON(geom) as geom, b.no2
                FROM  public.suburban30 AS a
                JOIN  public.no2_7day_forecast_suburban AS b
                      ON a.id::text = b.id
                WHERE  b.dt ='${date}'`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/// get data from join query forecast no2 rural
app.get('/api/no2_7day_forecast_rural/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const sql = `SELECT a.id, dt, ST_AsGeoJSON(geom) as geom, b.no2
                FROM  public.rural30 AS a
                JOIN  public.no2_7day_forecast_rural AS b
                      ON a.id::text = b.id
                WHERE  b.dt ='${date}'`

    console.log(sql);
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.use(express.static('www'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

