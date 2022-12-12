// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: car;
const widget = new ListWidget();
widget.backgroundColor = Color.white();

const mainStack = widget.addStack();
mainStack.layoutHorizontally();
mainStack.centerAlignContent();

const nextRaceStack = mainStack.addStack();
nextRaceStack.layoutVertically();
nextRaceStack.centerAlignContent();

const nextRaceData = await fetchNextRace();

if (nextRaceData.season) {
  const car = nextRaceStack.addText("🏎💨");
  car.font = Font.boldSystemFont(40);
  car.leftAlignText();
  nextRaceStack.addSpacer(8);

  const title = nextRaceStack.addText("See you in");
  title.font = Font.systemFont(23);
  title.textColor = Color.black();

  const season = nextRaceStack.addText(nextRaceData.season);
  season.font = Font.boldSystemFont(42);
  season.textColor = Color.black();
} else {
  mainStack.setPadding(0, 4, 0, 0);
  mainStack.addSpacer();

  await setNextCircuitStack(nextRaceStack, nextRaceData);
  await setNextRaceStack(nextRaceStack, nextRaceData);
  await setNextQualyStack(nextRaceStack, nextRaceData);
}

Script.setWidget(widget);
Script.complete();
widget.presentSmall();

function setTitle(parent, title) {
  const stackTitle = parent.addText(title);
  stackTitle.font = Font.systemFont(10);
  stackTitle.textColor = Color.darkGray();
}

async function setNextCircuitStack(parent, nextRaceData) {
  const country = parent.addText(mapNextRaceCountry(nextRaceData));
  country.font = Font.boldSystemFont(12);
  country.textColor = Color.black();
  country.lineLimit = 1;

  const circuitName = parent.addText(mapCircuitName(nextRaceData));
  circuitName.font = Font.regularSystemFont(12);
  circuitName.textColor = Color.black();
  circuitName.lineLimit = 1;
  parent.addSpacer(2);

  const circuit = await fetchCircuit(nextRaceData.circuitId);
  const circuitImage = parent.addImage(circuit);
  circuitImage.imageSize = new Size(42, 42);
  parent.addSpacer(2);
}

async function setNextRaceStack(parent, nextRaceData) {
  setTitle(parent, "🏁 Race time:");
  addDateStack(parent, nextRaceData.raceDate, nextRaceData.racetime, 7200000);
}

async function setNextQualyStack(parent, nextRaceData) {
  if (nextRaceData.sprintDate) {
    setTitle(parent, "🏎 Sprint time:");
    addDateStack(
      parent,
      nextRaceData.sprintDate,
      nextRaceData.sprintTime,
      3600000
    );
  } else {
    setTitle(parent, "⏱ Qualy time:");
    addDateStack(
      parent,
      nextRaceData.qualyDate,
      nextRaceData.qualyTime,
      3600000
    );
  }
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
  liveNowText.textColor = Color.black();
  liveNowText.lineLimit = 1;

  const liveNowEmoji = liveNowStack.addText(" 🔴");
  liveNowEmoji.font = Font.regularSystemFont(7);
  liveNowEmoji.textColor = Color.black();
  liveNowEmoji.lineLimit = 1;
}

function setDateAsTimer(parentStack, date) {
  const dateStack = parentStack.addDate(date);
  dateStack.applyTimerStyle();
  dateStack.font = Font.regularSystemFont(12);
  dateStack.textColor = Color.black();
  dateStack.lineLimit = 1;
}

function setDateStack(parentStack, date) {
  const dateStack = parentStack.addText(date);
  dateStack.font = Font.regularSystemFont(12);
  dateStack.textColor = Color.black();
  dateStack.lineLimit = 1;
  dateStack.minimumScaleFactor = 0.9;
}

function mapDateAsString(date) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000).setHours(0, 0, 0, 0);
  const raceDay = new Date(date).setHours(0, 0, 0, 0);
  let dateText = "Today ";
  if (raceDay === tomorrow) {
    dateText = "Tomorrow ";
  }
  const df = new DateFormatter();
  df.dateFormat = "h:mm a";
  return dateText + df.string(date);
}

function mapDateAsThisWeek(date) {
  const df = new DateFormatter();
  df.dateFormat = "E 'at' h:mm a";
  return df.string(date);
}

function mapDateAsCalendarDay(date) {
  const df = new DateFormatter();
  df.dateFormat = "E d/M h:mm a";
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
  return timeUntil(date) - 86400000 <= 0;
}

function lessThanOneWeekUntil(date) {
  return timeUntil(date) - 432000000 <= 0;
}

function timeUntil(date) {
  const now = new Date();
  return date - now;
}

async function fetchNextRace() {
  const req = new Request(`http://ergast.com/api/f1/current/next.json`);
  const data = await req.loadJSON();

  if (!data.MRData.RaceTable.Races.length) {
    return data.MRData.RaceTable;
  }
  const name = data.MRData.RaceTable.Races[0].raceName;
  const country = data.MRData.RaceTable.Races[0].Circuit.Location.country;
  const circuitId = data.MRData.RaceTable.Races[0].Circuit.circuitId;
  const circuitName = data.MRData.RaceTable.Races[0].Circuit.circuitName;

  const raceDate = data.MRData.RaceTable.Races[0].date;
  const racetime = data.MRData.RaceTable.Races[0].time;

  const qualyDate = data.MRData.RaceTable.Races[0].Qualifying.date;
  const qualyTime = data.MRData.RaceTable.Races[0].Qualifying.time;

  const sprintDate = data.MRData.RaceTable.Races[0].Sprint?.date;
  const sprintTime = data.MRData.RaceTable.Races[0].Sprint?.time;

  const nextRaceData = {
    name,
    country,
    circuitId,
    circuitName,
    raceDate,
    racetime,
    qualyDate,
    qualyTime,
    sprintDate,
    sprintTime,
  };

  return nextRaceData;
}

async function fetchCircuit(circuit) {
  const req = new Request(mapCircuitImage(circuit));
  return req.loadImage();
}

function mapCircuitImage(circuit) {
  switch (circuit) {
    case "bahrain":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png.transform/8col/image.png";
      break;
    case "jeddah":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Bahrain%20carbon.png.transform/3col/image.png";
      break;
    case "albert_park":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Australia%20carbon.png.transform/3col/image.png";
      break;
    case "imola":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Emilia%20Romagna%20carbon.png.transform/3col/image.png";
      break;
    case "miami":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Miami%20carbon.png.transform/3col/image.png";
      break;
    case "catalunya":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png.transform/3col/image.png";
      break;
    case "monaco":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Monte%20Carlo%20carbon.png.transform/3col/image.png";
      break;
    case "baku":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Azerbaijan%20carbon.png.transform/3col/image.png";
      break;
    case "villeneuve":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Canada%20carbon.png.transform/3col/image.png";
      break;
    case "silverstone":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Great%20Britain%20carbon.png.transform/3col/image.png";
      break;
    case "red_bull_ring":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Austria%20carbon.png.transform/3col/image.png";
      break;
    case "ricard":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/France%20carbon.png.transform/3col/image.png";
      break;
    case "hungaroring":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Hungar%20carbon.png.transform/3col/image.png";
      break;
    case "spa":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Belgium%20carbon.png.transform/3col/image.png";
      break;
    case "zandvoort":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Netherlands%20carbon.png.transform/3col/image.png";
      break;
    case "monza":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Italy%20carbon.png.transform/3col/image.png";
      break;
    case "marina_bay":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Singapor%20carbon.png.transform/3col/image.png";
      break;
    case "suzuka":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Japan%20carbon.png.transform/3col/image.png";
      break;
    case "americas":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/USA%20carbon.png.transform/3col/image.png";
      break;
    case "rodriguez":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Mexico%20carbon.png.transform/3col/image.png";
      break;
    case "interlagos":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Brazil%20carbon.png.transform/3col/image.png";
      break;
    case "yas_marina":
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Abu%20Dhab%20carbon.png.transform/3col/image.png";
      break;
    default:
      return "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png.transform/8col/image.png";
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

function mapCircuitName(circuit) {
  switch (circuit.circuitId) {
    case "bahrain":
      return "Bahrain";
      break;
    case "jeddah":
      return "Jeddah";
      break;
    case "albert_park":
      return "Albert Park";
      break;
    case "imola":
      return "Imola";
      break;
    case "miami":
      return "Miami";
      break;
    case "catalunya":
      return "Catalunya";
      break;
    case "monaco":
      return "Monaco";
      break;
    case "baku":
      return "Baku";
      break;
    case "villeneuve":
      return "Gilles Villeneuve";
      break;
    case "silverstone":
      return "Silverstone";
      break;
    case "red_bull_ring":
      return "Red Bull Ring";
      break;
    case "ricard":
      return "Paul Ricard";
      break;
    case "hungaroring":
      return "Hungaroring";
      break;
    case "spa":
      return "Spa Francorchamps";
      break;
    case "zandvoort":
      return "Zandvoort";
      break;
    case "monza":
      return "Monza";
      break;
    case "marina_bay":
      return "Marina Bay";
      break;
    case "suzuka":
      return "Suzuka";
      break;
    case "americas":
      return "COTA";
      break;
    case "rodriguez":
      return "Hermanos Rodríguez";
      break;
    case "interlagos":
      return "Interlagos";
      break;
    case "yas_marina":
      return "Yas Marina";
      break;
    default:
      return circuit.circuitName;
  }
}
