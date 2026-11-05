# Sunday Funday Fantasy Football League — 2026–2027

Custom analytics website for ESPN fantasy football league **204112345**.

## Planned features
- All-play records and standings against the weekly median
- Schedule-swap matrix: each team's record with every other manager's schedule
- Luck rankings: actual wins versus schedule-neutral expected wins
- Projected versus actual points, weekly scoring and consistency
- Optimal legal lineups, bench mistakes, and lineup efficiency (subject to historical roster availability)
- Draft, waiver, and trade evaluations
- Playoff simulations, manager profiles, and weekly league awards

## Automated updates
A scheduled GitHub Actions workflow will fetch league data from ESPN's unofficial API, validate it, calculate metrics, and publish the latest successful snapshot. The public site will show the last-updated timestamp. Historical weekly snapshots will be retained for accurate comparisons.

**Project status:** Repository initialized. Website and automatic syncing still need to be built and deployed.

**Security:** Never commit ESPN passwords or session cookies. If authentication is required, store credentials as GitHub Actions secrets.

Unofficial fan project, not affiliated with ESPN.
