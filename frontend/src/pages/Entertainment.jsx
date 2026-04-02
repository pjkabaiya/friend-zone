import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Entertainment() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [teamsData, matchesData] = await Promise.all([
      api.league.getTeams(),
      api.league.getMatches()
    ]);
    setTeams(Array.isArray(teamsData) ? teamsData : []);
    setMatches(Array.isArray(matchesData) ? matchesData : []);
  };

  const getGoalDifference = (team) => {
    return team.goalsFor - team.goalsAgainst;
  };

  return (
    <>
      <Navbar />
      <div className="page-hero entertainment-hero">
        <div className="entertainment-mascot">⚽</div>
        <h1>E-FOOTBALL LEAGUE</h1>
        <p>Where legends are made and trophies are won 🏆</p>
      </div>
      
      <main className="page-content">
        <section id="league">
          <div className="league-container">
            <div className="league-header">
              <div className="league-tabs">
                <button className="league-tab active">Standings</button>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="empty-state">
                <span className="empty-emoji">⚽</span>
                <p>No teams yet</p>
                <p className="empty-sub">Ask admin to add teams to start the league</p>
              </div>
            ) : (
              <div className="standings-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="team-col">Team</th>
                      <th>P</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>GD</th>
                      <th>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr key={team._id} className={index < 3 ? 'top-3' : ''}>
                        <td className="rank">{index + 1}</td>
                        <td className="team-name">
                          <span className="team-badge">{team.name.substring(0, 2).toUpperCase()}</span>
                          {team.name}
                        </td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.drawn}</td>
                        <td>{team.lost}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td className={getGoalDifference(team) > 0 ? 'positive' : getGoalDifference(team) < 0 ? 'negative' : ''}>
                          {getGoalDifference(team) > 0 ? '+' : ''}{getGoalDifference(team)}
                        </td>
                        <td className="points">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {matches.length > 0 && (
              <div className="matches-section">
                <h3 className="subsection-title">Recent Matches</h3>
                <div className="matches-grid">
                  {matches.map((match) => (
                    <div key={match._id} className={`match-card ${match.played ? 'played' : 'pending'}`}>
                      <div className="match-teams">
                        <span className="match-team">{match.homeTeam?.name || 'TBD'}</span>
                        <div className="match-score">
                          {match.played ? (
                            <>
                              <span className={match.homeScore > match.awayScore ? 'winner' : ''}>{match.homeScore}</span>
                              <span className="score-divider">-</span>
                              <span className={match.awayScore > match.homeScore ? 'winner' : ''}>{match.awayScore}</span>
                            </>
                          ) : (
                            <span className="vs">vs</span>
                          )}
                        </div>
                        <span className="match-team">{match.awayTeam?.name || 'TBD'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
