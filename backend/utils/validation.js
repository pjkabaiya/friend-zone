const { z } = require('zod');

const emojiSchema = z.object({
  emoji: z.string().trim().min(1).max(8)
});

const registerSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(60).optional()
});

const loginSchema = z.object({
  username: z.string().trim().min(1).max(30),
  password: z.string().min(1).max(128)
});

const postCreateSchema = z.object({
  content: z.string().trim().min(1).max(5000)
});

const jokeCreateSchema = z.object({
  text: z.string().trim().min(1).max(500),
  context: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).optional()
});

const bucketListCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  category: z.enum(['adventure', 'food', 'travel', 'skills', 'funny', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

const eventCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  date: z.coerce.date(),
  type: z.enum(['birthday', 'reunion', 'other']),
  location: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional()
});

const eventUpdateSchema = eventCreateSchema.partial();

const galleryCreateSchema = z.object({
  caption: z.string().trim().max(300).optional(),
  category: z.enum(['beach', 'cabin', 'city', 'meme', 'random', 'other']).optional(),
  rotation: z.coerce.number().min(-180).max(180).optional()
});

const galleryUpdateSchema = z.object({
  caption: z.string().trim().max(300).optional(),
  category: z.enum(['beach', 'cabin', 'city', 'meme', 'random', 'other']).optional()
});

const moodCreateSchema = z.object({
  mood: z.enum(['😄', '😊', '😐', '😔', '😤', '🤩', '😴', '🥳']),
  moodLabel: z.enum(['Amazing', 'Good', 'Okay', 'Down', 'Frustrated', 'Excited', 'Tired', 'Celebrating']),
  note: z.string().trim().max(300).optional()
});

const userCreateSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(60),
  insideJoke: z.string().trim().max(120).optional(),
  role: z.enum(['admin', 'member']).optional()
});

const userUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(400).optional(),
  insideJoke: z.string().trim().max(120).optional(),
  role: z.enum(['admin', 'member']).optional(),
  avatar: z.string().trim().max(500)
    .refine((value) => value.startsWith('/avatars/') || value.startsWith('/uploads/') || /^https?:\/\//.test(value), 'Invalid avatar URL.')
    .optional(),
  password: z.string().min(8).max(128).optional()
});

const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(400).optional(),
  insideJoke: z.string().trim().max(120).optional(),
  avatar: z.string().trim().max(500).optional()
});

const leagueTeamSchema = z.object({
  name: z.string().trim().min(1).max(60)
});

const leagueMatchSchema = z.object({
  homeTeamId: z.string().trim().min(1),
  awayTeamId: z.string().trim().min(1),
  homeScore: z.coerce.number().int().min(0).max(99).optional(),
  awayScore: z.coerce.number().int().min(0).max(99).optional(),
  matchDay: z.coerce.number().int().min(1).max(100).optional()
});

const leagueResultSchema = z.object({
  homeScore: z.coerce.number().int().min(0).max(99),
  awayScore: z.coerce.number().int().min(0).max(99)
});

function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message || 'Invalid request payload.'
    };
  }
  return { ok: true, data: result.data };
}

function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '20', 10), 1), 100);
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

module.exports = {
  emojiSchema,
  registerSchema,
  loginSchema,
  postCreateSchema,
  jokeCreateSchema,
  bucketListCreateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  galleryCreateSchema,
  galleryUpdateSchema,
  moodCreateSchema,
  userCreateSchema,
  userUpdateSchema,
  profileUpdateSchema,
  leagueTeamSchema,
  leagueMatchSchema,
  leagueResultSchema,
  validate,
  parsePagination
};
