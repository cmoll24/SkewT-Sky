// Fetch sounding data (moved from earlier example)
async function FetchSoundingData(station, date) {

  const day = new Date(date);
  const nextDay = new Date(day);
  nextDay.setUTCDate(day.getUTCDate() + 1); // add 1 day

  console.log(day.toISOString(), nextDay.toISOString())

  const params = new URLSearchParams({
    station: station,
    sts: `${date}T00:00:00Z`,
    ets: `${date}T00:00:01Z`,
    //dl: true  //dl = download CSV
  });

  const url = `https://mesonet.agron.iastate.edu/cgi-bin/request/raob.py?${params.toString()}`;


  try {
    console.log(url);
    const response = await fetch(url);

    console.log(response);

    if (!response.ok) {
      console.error(`Failed to fetch data. Status: ${response.status}`);
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

  // Build table
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

  table += "</tbody></table>";

  document.getElementById('result').innerHTML = table;
} else {
  document.getElementById('result').textContent = "Failed to fetch or parse data.";
}

});
