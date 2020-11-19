const manager = require('./manager');
const express = require('express');
const app = express();

app.get('/faucet', async function (req, res) {
  const address = req.query.address;
  const txHash = await manager.faucetTo(address);
  res.json({ txHash });
});

app.listen(3000, () => {
  manager.run();
});