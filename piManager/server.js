const manager = require('./manager');
const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.static('public'));
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