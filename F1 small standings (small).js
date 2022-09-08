// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: car-alt;
const widget = new ListWidget();
let color = Color.white();
color.alpha = 0.5;
widget.backgroundColor = color;

const mainStack = widget.addStack();
mainStack.layoutHorizontally();
mainStack.centerAlignContent();
mainStack.setPadding(0, 0, 0, 0);

const standingsStack = mainStack.addStack();
standingsStack.layoutVertically();
standingsStack.centerAlignContent();

standingsStack.addSpacer(4);
await setDriverStandingsStack(standingsStack);
standingsStack.addSpacer(7);
await setConstructorsStandingsStack(standingsStack);

Script.setWidget(widget);
Script.complete();
widget.presentSmall();


async function setDriverStandingsStack(parent) {
    const driversStandingsStack = parent.addStack();
    driversStandingsStack.layoutVertically();
    driversStandingsStack.topAlignContent();
    setDriverStandingsTitle(driversStandingsStack);

    let drivers = await fetchDriverStandings();
    await setStandingsStack(driversStandingsStack, drivers);
}

function setDriverStandingsTitle(parent) {
    const standingsTitleStack = parent.addStack();
    standingsTitleStack.layoutHorizontally();
    standingsTitleStack.centerAlignContent();
    standingsTitleStack.spacing = 1;

    // const emoji = standingsTitleStack.addText('👨🏻‍🚀 ');
    // emoji.font = Font.regularSystemFont(9);
    // emoji.textColor = Color.black();

    const standingsTitle = standingsTitleStack.addText('Drivers');
    standingsTitle.font = Font.boldSystemFont(12);
    standingsTitle.textColor = Color.black();
    standingsTitle.lineLimit = 1;
}

async function setConstructorsStandingsStack(parent) {
  const constructorsStandingsStack = parent.addStack();
  constructorsStandingsStack.layoutVertically();
  constructorsStandingsStack.topAlignContent();
  setConstructorsStandingsTitle(constructorsStandingsStack);

  let constructors = await fetchConstructorsStandings();
  await setStandingsStack(constructorsStandingsStack, constructors);
}

function setConstructorsStandingsTitle(parent) {
    const standingsTitleStack = parent.addStack();
    standingsTitleStack.layoutHorizontally();
    standingsTitleStack.centerAlignContent();
    standingsTitleStack.spacing = 1;

    // const emoji = standingsTitleStack.addText('🏎 ');
    // emoji.font = Font.regularSystemFont(9);
    // emoji.textColor = Color.black();

    const standingsTitle = standingsTitleStack.addText('Constructors');
    standingsTitle.font = Font.boldSystemFont(12);
    standingsTitle.textColor = Color.black();
    standingsTitle.lineLimit = 1;
}



async function setStandingsStack(parent, standings) {
  for (const standing of standings) {
    parent.addSpacer(3);
    const names = parent.addStack();
    names.layoutHorizontally();
    names.centerAlignContent();

    const teamLogo = await fetchTeamLogo(standing.constructorId);
    const teamLogoImage = names.addImage(teamLogo);
    teamLogoImage.imageSize = new Size(12, 12);
    names.addSpacer(4);

    const driverText = names.addText(standing.name);
    driverText.font = Font.regularSystemFont(10);
    driverText.textColor = Color.black();
    names.addSpacer(4);
    const pointsText = names.addText(`(${standing.points})`);
    pointsText.font = Font.regularSystemFont(8);
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


