// Fetch sounding data (moved from earlier example)
async function FetchSoundingData(station, date) {

  const day = new Date(date + "T00:00:00Z"); // Ensure it's treated as UTC
  const nextDay = new Date(day);
  nextDay.setUTCDate(day.getUTCDate() + 1); // add 1 day

  console.log(day.toISOString(), nextDay.toISOString());

  const params = new URLSearchParams({
    station: station,
    sts: day.toISOString(),
    ets: nextDay.toISOString(),
    //sts: `${date}T00:00:00Z`,
    //ets: `${date}T00:00:01Z`,
    //dl: true  //dl = download CSVS
  });

  const url = `https://mesonet.agron.iastate.edu/cgi-bin/request/raob.py?${params.toString()}`;


  try {
    console.log(url);
    const response = await fetch(url);

    console.log(response);

    if (!response.ok) {
      console.error(`Failed to fetch data. Status: HTTP ${response.status}`);
      return null;
    }

    const text = await response.text();

    console.log(text);

    // Parse CSV using PapaParse
    const parsed = Papa.parse(text.trim(), {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length > 0) {
      console.error("Error parsing CSV:", parsed.errors);
      return null;
    }

    console.log(parsed);

    return parsed.data;
  } catch (err) {
    console.error("Error fetching or parsing data:", err);
    return null;
  }
}

// Hook into the form
document.getElementById('cloudForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const station = document.getElementById('station').value;
  const date = document.getElementById('date').value;

  document.getElementById('result').textContent = "Fetching data...";

  const data = await FetchSoundingData(station, date);

  if (data) {
  const rows = data;

  renderTablesByTime(rows, 'validUTC', 'result');

} else {
  document.getElementById('result').textContent = "Failed to fetch or parse data.";
}

});

//Build table
function buildTable(rows) {
  let table = "<table border='1' cellspacing='0' cellpadding='5'><thead><tr>";

  // Add headers from keys of first row
  Object.keys(rows[0]).forEach(key => {
    table += `<th>${key}</th>`;
  });
  table += "</tr></thead><tbody>";

  rows.forEach(row => {
    table += "<tr>";
    Object.values(row).forEach(val => {
      table += `<td>${val}</td>`;
    });
    table += "</tr>";
  });

  return table;
}

function groupByTime(rows, timeKey) {
  const groups = {};
  rows.forEach(row => {
    const time = row[timeKey];
    if (!groups[time]) {
      groups[time] = [];
    }

    groups[time].push(row);
  });

  return groups;
}

function renderTablesByTime(rows, timeKey, containerId) {

  const container = document.getElementById(containerId);

  if (!rows || rows.length === 0) {
    container.textContent = "No data found.";
    return;
  }

  const grouped = groupByTime(rows, timeKey);

  let html = "";

  Object.keys(grouped)
    .sort() // chronological order
    .forEach(time => {
      html += buildTable(grouped[time]);
      html += `<h3>${time}</h3>`;
      html += "<br>";
    });

  container.innerHTML = html;
}
