const manager = require('./manager');
const express = require('express');
const app = express();

app.get('/faucet', async function (req, res) {
  const address = req.query.address;
  const txHash = await manager.faucetTo(address);
  res.json({ txHash });
});

app.get('/stat', async function (req, res) {
  const stat = manager.stat;
  res.json(stat);
});

app.listen(8877, () => {
  manager.run();
});