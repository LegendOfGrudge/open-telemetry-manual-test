/*app.js*/
const { trace, metrics, ValueType } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const histogram = meter.createHistogram(
    'http.server.duration',
    {
      description: 'A distribution of the HTTP server response times',
      unit: 'milliseconds',
      valueType: 1,
    },
  );
  const startTime = new Date().getTime();

  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  histogram.record(parseInt(executionTime));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});