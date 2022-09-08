// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: car-side;
const widget = new ListWidget();
let color = Color.white();
color.alpha = 0.5;
widget.backgroundColor = color;

widget.addSpacer(4);
const mainStack = widget.addStack();
mainStack.layoutVertically();
mainStack.centerAlignContent();
mainStack.spacing = 8;

const standingsStack = mainStack.addStack();
standingsStack.layoutHorizontally();
standingsStack.centerAlignContent();

await setDriverStandingsStack(standingsStack);
standingsStack.spacing = 28;
await setConstructorsStandingsStack(standingsStack);

await setNextRaceStack(mainStack);

Script.setWidget(widget);
Script.complete();
widget.presentMedium();

async function setDriverStandingsStack(parent) {
  const driversStandingsStack = parent.addStack();
  driversStandingsStack.layoutVertically();
  driversStandingsStack.topAlignContent();

  let drivers = await fetchDriverStandings();
  setTitle(driversStandingsStack, "Driver standings:");
  await setStandingsStack(driversStandingsStack, drivers);
}

async function setConstructorsStandingsStack(parent) {
  const constructorsStandingsStack = parent.addStack();
  constructorsStandingsStack.layoutVertically();
  constructorsStandingsStack.topAlignContent();

  let constructors = await fetchConstructorsStandings();
  setTitle(constructorsStandingsStack, "Constructors standings:");
  await setStandingsStack(constructorsStandingsStack, constructors);
}

function setTitle(parent, title) {
  const stackTitle = parent.addText(title);
  stackTitle.font = Font.systemFont(10);
  stackTitle.textColor = Color.darkGray();
}

async function setStandingsStack(parent, standings) {
  for (const standing of standings) {
    parent.addSpacer(2);
    const names = parent.addStack();
    names.layoutHorizontally();
    names.centerAlignContent();

    const teamLogo = await fetchTeamLogo(standing.constructorId);
    const teamLogoImage = names.addImage(teamLogo);
    teamLogoImage.imageSize = new Size(12, 12);
    names.addSpacer(4);

    const driverText = names.addText(standing.name);
    driverText.font = Font.regularSystemFont(11);
    driverText.textColor = Color.black();
    names.addSpacer(4);
    const pointsText = names.addText(`(${standing.points})`);
    pointsText.font = Font.regularSystemFont(10);
    pointsText.textColor = Color.darkGray();
  }
}

async function fetchDriverStandings() {
  const req = new Request(
    `http://ergast.com/api/f1/current/driverStandings.json?limit=3`
  );
  const data = await req.loadJSON();
  const driverStandings =
    data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  return mapDriverStandings(driverStandings);
}

function mapDriverStandings(driverStandings) {
  let mappedDriverStandings = [];
  driverStandings.forEach((standing) => {
    let mappedDriverStanding = {
      name: standing.Driver.givenName + " " + standing.Driver.familyName,
      points: standing.points,
      constructorId: standing.Constructors[0].constructorId,
    };
    mappedDriverStandings.push(mappedDriverStanding);
  });
  return mappedDriverStandings;
}

async function fetchConstructorsStandings() {
  const req = new Request(
    `http://ergast.com/api/f1/current/constructorStandings.json?limit=3`
  );
  const data = await req.loadJSON();
  const constructorsStandings =
    data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
  return mapConstructorsStandings(constructorsStandings);
}

function mapConstructorsStandings(constructorsStandings) {
  let mappedConstructorsStandings = [];
  constructorsStandings.forEach((standing) => {
    let mappedConstructorsStanding = {
      name: standing.Constructor.name,
      points: standing.points,
      constructorId: standing.Constructor.constructorId,
    };
    mappedConstructorsStandings.push(mappedConstructorsStanding);
  });
  return mappedConstructorsStandings;
}

async function setNextRaceStack(parent) {
  const nextRaceStack = parent.addStack();
  nextRaceStack.layoutVertically();
  nextRaceStack.centerAlignContent();

  setTitle(nextRaceStack, "Next race:");

  const nextRaceData = await fetchNextRace();

  const location = nextRaceStack.addText(mapNextRaceLocation(nextRaceData));
  location.font = Font.regularSystemFont(12);
  location.textColor = Color.black();
  location.lineLimit = 1;
  
  setRaceStack(nextRaceStack, nextRaceData);

  setQualyStack(nextRaceStack, nextRaceData);
}

function setRaceStack(parentStack, nextRaceData) {
    parentStack.addSpacer(2);

    const nextRaceInfoStack = parentStack.addStack();
    nextRaceInfoStack.layoutHorizontally();
    nextRaceInfoStack.centerAlignContent();
    nextRaceInfoStack.spacing = 7;
  
    const nextRaceText = nextRaceInfoStack.addStack();
    nextRaceText.layoutHorizontally();
    nextRaceText.centerAlignContent();
    nextRaceText.spacing = 1;
  
    const raceEmoji = nextRaceText.addText('🏁 ');
    raceEmoji.font = Font.regularSystemFont(11);
    raceEmoji.textColor = Color.black();
    const race = nextRaceText.addText('Race');
    race.font = Font.regularSystemFont(12);
    race.textColor = Color.black();
  
    addDateStack(
      nextRaceInfoStack,
      nextRaceData.raceDate,
      nextRaceData.raceTime,
      3600000
    );
}

function setQualyStack(parentStack, nextRaceData) {
    parentStack.addSpacer(2);

    const qualyInfoStack = parentStack.addStack();
    qualyInfoStack.layoutHorizontally();
    qualyInfoStack.centerAlignContent();
    qualyInfoStack.spacing = 7;

    const nextQualyText = qualyInfoStack.addStack();
    nextQualyText.layoutHorizontally();
    nextQualyText.centerAlignContent();
    nextQualyText.spacing = 1;

    const qualyEmoji = nextQualyText.addText('⏱ ');
    qualyEmoji.font = Font.regularSystemFont(11);
    qualyEmoji.textColor = Color.black();
    const qualy = nextQualyText.addText('Qualifying');
    qualy.font = Font.regularSystemFont(12);
    qualy.textColor = Color.black();

    addDateStack(
        qualyInfoStack,
        nextRaceData.qualyDate,
        nextRaceData.qualyTime,
        3600000
    );
}

function mapNextRaceLocation(nextRaceData) {
  return (
    mapCountryFlag(nextRaceData.country) +
    " " +
    nextRaceData.country +
    ", " +
    nextRaceData.circuitName
  );
}

function mapNextRaceCountry(nextRaceData) {
  return mapCountryFlag(nextRaceData.country) + " " + nextRaceData.country;
}
  
function addDateStack(parentStack, date, time, eventDuration) {
  const raceDate = new Date(date + "T" + time);

  if (isCompleted(raceDate, eventDuration)) {
    setDateStack(parentStack, "Completed");
  } else if (isLiveNow(raceDate, eventDuration)) {
    setLiveNow(parentStack);
  } else if (lessThanOneHourUntil(raceDate)) {
    setDateAsTimer(parentStack, raceDate);
  } else if (lessThanTwoDaysUntil(raceDate)) {
    let dateAsString = mapDateAsString(raceDate);
    setDateStack(parentStack, dateAsString);
  } else if (lessThanOneWeekUntil(raceDate)) {
    let dateAsString = mapDateAsThisWeek(raceDate);
    setDateStack(parentStack, dateAsString);
  } else {
    let dateAsString = mapDateAsCalendarDay(raceDate);
    setDateStack(parentStack, dateAsString);
  }
  parentStack.addSpacer(4);
}

function setLiveNow(parentStack) {
  const liveNowStack = parentStack.addStack();
  liveNowStack.layoutHorizontally();
  liveNowStack.centerAlignContent();

  const liveNowText = liveNowStack.addText("Live now");
  liveNowText.font = Font.boldSystemFont(12);
  liveNowText.textColor = Color.darkGray();
  liveNowText.lineLimit = 1;

  const liveNowEmoji = liveNowStack.addText(" 🔴");
  liveNowEmoji.font = Font.regularSystemFont(7);
  liveNowEmoji.textColor = Color.darkGray();
  liveNowEmoji.lineLimit = 1;
}

function setDateAsTimer(parentStack, date) {
  const dateStack = parentStack.addDate(date);
  dateStack.applyTimerStyle();
  dateStack.font = Font.regularSystemFont(12);
  dateStack.textColor = Color.darkGray();
  dateStack.lineLimit = 1;
}

function setDateStack(parentStack, date) {
  const dateStack = parentStack.addText(date);
  dateStack.font = Font.regularSystemFont(12);
  dateStack.textColor = Color.darkGray();
  dateStack.lineLimit = 1;
}

function mapDateAsString(date) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);  
  const df = new DateFormatter();
  df.dateFormat = "h:mm a";
  let dateText;
  if ((new Date(date)).setHours(0, 0, 0, 0) === tomorrow.setHours(0, 0, 0, 0)) {
    dateText = "Tomorrow at ";
  } else {
    dateText = "Today at ";
  }
  return dateText + df.string(date);
}

function mapDateAsThisWeek(date) {
  const df = new DateFormatter();
  df.dateFormat = "EEEE 'at' h:mm a";
  return df.string(date);
}

function mapDateAsCalendarDay(date) {
  const df = new DateFormatter();
  df.dateFormat = "EEEE d/M 'at' h:mm a";
  return df.string(date);
}

function isCompleted(date, eventDuration) {
  return timeUntil(date) < -eventDuration;
}

function isLiveNow(date, eventDuration) {
  return timeUntil(date) <= 0 && timeUntil(date) >= -eventDuration;
}

function lessThanOneHourUntil(date) {
  return timeUntil(date) - 3600000 <= 0;
}

function lessThanTwoDaysUntil(date) {
  return timeUntil(date) - 172800000 <= 0;
}

function lessThanOneWeekUntil(date) {
  return timeUntil(date) - 604800000 <= 0;
}

function timeUntil(date) {
  const now = new Date();
  return date - now;
}

async function fetchNextRace() {
  const req = new Request(`http://ergast.com/api/f1/current/next.json`);
  const data = await req.loadJSON();

  const circuitName = data.MRData.RaceTable.Races[0].Circuit.circuitName;
  const country = data.MRData.RaceTable.Races[0].Circuit.Location.country;
  const raceDate = data.MRData.RaceTable.Races[0].date;
  const raceTime = data.MRData.RaceTable.Races[0].time;
  const qualyDate = data.MRData.RaceTable.Races[0].Qualifying.date;
  const qualyTime = data.MRData.RaceTable.Races[0].Qualifying.time;

  const nextRaceData = {
    circuitName,
    country,
    raceDate,
    raceTime,
    qualyDate,
    qualyTime
  };

  return nextRaceData;
}

async function fetchTeamLogo(team) {
  const req = new Request(mapTeamLogo(team));
  return req.loadImage();
}

function mapTeamLogo(team) {
  switch (team) {
    case "red_bull":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/red-bull-racing-logo.png.transform/2col/image.png";
      break;
    case "alfa":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/alfa-romeo-logo.png.transform/2col/image.png";
      break;
    case "alphatauri":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/alphatauri-logo.png.transform/2col/image.png";
      break;
    case "alpine":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/alpine-logo.png.transform/2col/image.png";
      break;
    case "aston_martin":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/aston-martin-logo.png.transform/2col/image.png";
      break;
    case "ferrari":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/ferrari-logo.png.transform/2col/image.png";
      break;
    case "haas":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/haas-f1-team-logo.png.transform/2col/image.png";
      break;
    case "mclaren":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/mclaren-logo.png.transform/2col/image.png";
      break;
    case "mercedes":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/mercedes-logo.png.transform/2col/image.png";
      break;
    case "williams":
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/williams-logo.png.transform/2col/image.png";
      break;
    default:
      return "https://www.formula1.com/content/dam/fom-website/teams/2022/red-bull-racing-logo.png.transform/2col/image.png";
  }
}

function mapCountryFlag(country) {
  switch (country) {
    case "Bahrain":
      return "🇧🇭";
      break;
    case "Italy":
      return "🇮🇹";
      break;
    case "Portugal":
      return "🇵🇹";
      break;
    case "Spain":
      return "🇪🇸";
      break;
    case "Monaco":
      return "🇲🇨";
      break;
    case "Azerbaijan":
      return "🇦🇿";
      break;
    case "France":
      return "🇫🇷";
      break;
    case "Austria":
      return "🇦🇹";
      break;
    case "Australia":
      return "🇦🇺";
      break;
    case "UK":
      return "🇬🇧";
      break;
    case "Hungary":
      return "🇭🇺";
      break;
    case "Belgium":
      return "🇧🇪";
      break;
    case "Netherlands":
      return "🇳🇱";
      break;
    case "Russia":
      return "🇷🇺";
      break;
    case "Turkey":
      return "🇹🇷";
      break;
    case "USA":
      return "🇺🇸";
      break;
    case "Mexico":
      return "🇲🇽";
      break;
    case "Brazil":
      return "🇧🇷";
      break;
    case "Qatar":
      return "🇶🇦";
      break;
    case "Saudi Arabia":
      return "🇸🇦";
      break;
    case "Singapore":
      return "🇸🇬";
      break;
    case "Japan":
      return "🇯🇵";
      break;
    case "Canada":
      return "🇨🇦";
      break;
    case "UAE":
      return "🇦🇪";
      break;
    case "Morocco":
      return "🇲🇦";
      break;
    case "Sweden":
      return "🇸🇪";
      break;
    case "Germany":
      return "🇩🇪";
      break;
    case "Switzerland":
      return "🇨🇭";
      break;
    case "India":
      return "🇮🇳";
      break;
    case "Argentina":
      return "🇦🇷";
      break;
    case "South Africa":
      return "🇿🇦";
      break;
    default:
      return "🏴‍☠️";
  }
}

