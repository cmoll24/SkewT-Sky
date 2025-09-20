// Fetch sounding data (moved from earlier example)
async function FetchSoundingData(station, date) {
  const baseUrl = "https://weather.uwyo.edu/wsgi/sounding";
  const params = new URLSearchParams({
    datetime: `${date}%00:00:00`,
    id: station,
    type: "TEXT:CSV",
    src: "BUFR"
  });

  try {
    console.log(`${baseUrl}?${params.toString()}`);
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    console.log(response);

    if (!response.ok) {
      console.error(`Failed to fetch data. Status: ${response.status}`);
      return null;
    }

    const text = await response.text();

    if (!text.toLowerCase().includes("time")) {
      console.error("Invalid response (missing expected keyword).");
      return null;
    }

    // Parse CSV using PapaParse
    const parsed = Papa.parse(text.trim(), {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length > 0) {
      console.error("Error parsing CSV:", parsed.errors);
      return null;
    }

    return data;
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
    document.getElementById('result').textContent = JSON.stringify(data.slice(0, 10), null, 2);
  } else {
    document.getElementById('result').textContent = "Failed to fetch or parse data.";
  }
});