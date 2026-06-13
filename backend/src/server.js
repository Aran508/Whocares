// Local development entry point.
// On Vercel, api/index.js exports the app directly for serverless use instead.
const app = require('./app');
const { startAlertEngine } = require('./services/alertEngine');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ACIP backend running on port ${PORT}`);
  startAlertEngine();
});
