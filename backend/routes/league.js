const express = require('express');
const Team = require('../models/Team');
const Match = require('../models/Match');
const { auth, adminOnly } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const {
  leagueTeamSchema,
  leagueMatchSchema,
  leagueResultSchema,
  validate,
  parsePagination
} = require('../utils/validation');

const router = express.Router();

router.get('/teams', auth, async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req.query);
    const teams = await Team.find()
      .sort({ points: -1, goalsFor: -1, goalsAgainst: 1 })
      .skip(skip)
      .limit(limit);
    res.json({ items: teams, page, limit });
  } catch (error) {
    handleServerError(res, 'league.getTeams', error);
  }
});

router.post('/teams', auth, adminOnly, async (req, res) => {
  try {
    const parsed = validate(leagueTeamSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { name } = parsed.data;
    
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ error: 'Team already exists' });
    }

    const team = new Team({
      name,
      createdBy: req.user._id
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    handleServerError(res, 'league.addTeam', error);
  }
});

router.delete('/teams/:id', auth, adminOnly, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await Match.deleteMany({ $or: [{ homeTeam: team._id }, { awayTeam: team._id }] });
    await Team.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    handleServerError(res, 'league.deleteTeam', error);
  }
});

router.get('/matches', auth, async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req.query);
    const matches = await Match.find()
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .sort({ matchDay: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit);
    res.json({ items: matches, page, limit });
  } catch (error) {
    handleServerError(res, 'league.getMatches', error);
  }
});

router.post('/matches', auth, adminOnly, async (req, res) => {
  try {
    const parsed = validate(leagueMatchSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { homeTeamId, awayTeamId, homeScore, awayScore, matchDay } = parsed.data;

    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: 'Both teams are required' });
    }

    if (homeTeamId === awayTeamId) {
      return res.status(400).json({ error: 'Cannot match team against itself' });
    }

    const match = new Match({
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      homeScore: homeScore !== undefined ? homeScore : null,
      awayScore: awayScore !== undefined ? awayScore : null,
      played: homeScore !== undefined && awayScore !== undefined,
      matchDay: matchDay || 1,
      createdBy: req.user._id
    });

    await match.save();

    if (match.played) {
      await updateTeamStats(homeTeamId, awayTeamId, homeScore, awayScore);
    }

    const populatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');

    res.status(201).json(populatedMatch);
  } catch (error) {
    handleServerError(res, 'league.addMatch', error);
  }
});

router.put('/matches/:id/result', auth, adminOnly, async (req, res) => {
  try {
    const parsed = validate(leagueResultSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { homeScore, awayScore } = parsed.data;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.played) {
      await revertTeamStats(match.homeTeam, match.awayTeam, match.homeScore, match.awayScore);
    }

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.played = true;
    await match.save();

    await updateTeamStats(match.homeTeam, match.awayTeam, homeScore, awayScore);

    const populatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');

    res.json(populatedMatch);
  } catch (error) {
    handleServerError(res, 'league.updateResult', error);
  }
});

router.delete('/matches/:id', auth, adminOnly, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.played) {
      await revertTeamStats(match.homeTeam, match.awayTeam, match.homeScore, match.awayScore);
    }

    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    handleServerError(res, 'league.deleteMatch', error);
  }
});

router.delete('/reset', auth, adminOnly, async (req, res) => {
  try {
    await Team.deleteMany({});
    await Match.deleteMany({});
    res.json({ message: 'League reset successfully' });
  } catch (error) {
    handleServerError(res, 'league.reset', error);
  }
});

async function updateTeamStats(homeTeamId, awayTeamId, homeScore, awayScore) {
  const homeTeam = await Team.findById(homeTeamId);
  const awayTeam = await Team.findById(awayTeamId);

  homeTeam.goalsFor += homeScore;
  homeTeam.goalsAgainst += awayScore;
  awayTeam.goalsFor += awayScore;
  awayTeam.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    homeTeam.won += 1;
    homeTeam.points += 3;
    awayTeam.lost += 1;
  } else if (homeScore < awayScore) {
    awayTeam.won += 1;
    awayTeam.points += 3;
    homeTeam.lost += 1;
  } else {
    homeTeam.drawn += 1;
    homeTeam.points += 1;
    awayTeam.drawn += 1;
    awayTeam.points += 1;
  }

  homeTeam.played = homeTeam.won + homeTeam.drawn + homeTeam.lost;
  awayTeam.played = awayTeam.won + awayTeam.drawn + awayTeam.lost;

  await homeTeam.save();
  await awayTeam.save();
}

async function revertTeamStats(homeTeamId, awayTeamId, homeScore, awayScore) {
  const homeTeam = await Team.findById(homeTeamId);
  const awayTeam = await Team.findById(awayTeamId);

  homeTeam.goalsFor -= homeScore;
  homeTeam.goalsAgainst -= awayScore;
  awayTeam.goalsFor -= awayScore;
  awayTeam.goalsAgainst -= homeScore;

  if (homeScore > awayScore) {
    homeTeam.won -= 1;
    homeTeam.points -= 3;
    awayTeam.lost -= 1;
  } else if (homeScore < awayScore) {
    awayTeam.won -= 1;
    awayTeam.points -= 3;
    homeTeam.lost -= 1;
  } else {
    homeTeam.drawn -= 1;
    homeTeam.points -= 1;
    awayTeam.drawn -= 1;
    awayTeam.points -= 1;
  }

  homeTeam.played = homeTeam.won + homeTeam.drawn + homeTeam.lost;
  awayTeam.played = awayTeam.won + awayTeam.drawn + awayTeam.lost;

  await homeTeam.save();
  await awayTeam.save();
}

module.exports = router;
