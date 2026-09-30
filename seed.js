async function seed() {
  console.log("Seeding database...");

  try {
    await base44.entities.User.create({
      id: "zaidshaikh98848@gmail.com",
      email: "zaidshaikh98848@gmail.com",
      role: "admin"
    });
    await base44.entities.User.create({
      id: "6abcea54defcec3639c084c2",
      email: "zaidshaikh98848@gmail.com",
      role: "admin"
    });
  } catch (e) {}

  const station1 = await base44.entities.Station.create({ name: "Bharati Station", region: "antarctica", commissioned_year: 2012, status: "active", description: "India's third Antarctic research facility." });
  const station2 = await base44.entities.Station.create({ name: "Maitri Station", region: "antarctica", commissioned_year: 1989, status: "active", description: "India's second permanent research station in Antarctica." });
  const station3 = await base44.entities.Station.create({ name: "Himadri Station", region: "arctic", commissioned_year: 2008, status: "active", description: "India's first permanent Arctic research station." });

  const theme1 = await base44.entities.ResearchTheme.create({ name: "Climate Change", description: "Studying the impact of global warming on polar ice caps." });
  const theme2 = await base44.entities.ResearchTheme.create({ name: "Glaciology", description: "Understanding glacier dynamics and mass balance." });
  const theme3 = await base44.entities.ResearchTheme.create({ name: "Polar Biology", description: "Researching unique adaptations of polar flora and fauna." });

  const exp1 = await base44.entities.Expedition.create({ 
    title: "42nd Indian Scientific Expedition to Antarctica", 
    expedition_number: 42, 
    year: 2022,
    region: "antarctica",
    season: "2022-2023",
    stations: ["Bharati Station", "Maitri Station"],
    research_themes: ["Climate Change", "Glaciology"],
    description: "The 42nd ISEA focused on atmospheric observations, biological sciences, and earth sciences."
  });

  const exp2 = await base44.entities.Expedition.create({ 
    title: "1st Indian Arctic Expedition", 
    expedition_number: 1, 
    year: 2007,
    region: "arctic",
    season: "Summer 2007",
    stations: ["Himadri Station"],
    research_themes: ["Climate Change", "Polar Biology"],
    description: "The pioneering Indian expedition to the Arctic to study climate linkages."
  });

  await base44.entities.Asset.create({
    title: "Ice Core Analysis Report 2022",
    content_type: "report",
    description: "Detailed analysis of ice cores retrieved near Bharati Station.",
    review_status: "approved",
    station_id: "Bharati Station",
    research_theme: "Glaciology",
    year: 2022,
    region: "antarctica"
  });

  await base44.entities.Asset.create({
    title: "Arctic Flora Diversity Dataset",
    content_type: "dataset",
    description: "Comprehensive dataset of plant species recorded around Ny-Ålesund.",
    review_status: "approved",
    station_id: "Himadri Station",
    research_theme: "Polar Biology",
    year: 2007,
    region: "arctic"
  });

  await base44.entities.Asset.create({
    title: "Penguin Colony Aerial Survey",
    content_type: "photograph",
    description: "High-resolution aerial photographs of Adelie penguin colonies.",
    review_status: "approved",
    station_id: "Maitri Station",
    research_theme: "Polar Biology",
    year: 2022,
    region: "antarctica"
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
