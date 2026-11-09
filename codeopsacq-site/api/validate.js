// Shared validation for the application form (used by the Vercel function and the local preview server).
const TRACKS_MAX = 80;
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

function validateApplication(fields) {
  if (clean(fields.company_url, 200)) return { spam: true };
  const app = {
    name: clean(fields.name, 120),
    email: clean(fields.email, 200).toLowerCase(),
    company: clean(fields.company, 160),
    track: clean(fields.track, TRACKS_MAX),
    revenue: clean(fields.revenue, 80),
    constraint: clean(fields.constraint, 3000),
  };
  const errors = {};
  if (!app.name) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.email)) errors.email = "Enter a valid email.";
  if (!app.track) errors.track = "Pick the engagement you want.";
  return Object.keys(errors).length ? { errors } : { app };
}

module.exports = { validateApplication };
